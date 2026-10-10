"""FacultyLink web backend.

Flask serves the Administrator and Reviewer pages from the PostgreSQL
database used by the mobile app. The SQLite file was only the guide for
those table names. New mobile uploads are read from this database.
"""

import json
import re
from datetime import datetime
from pathlib import Path

import psycopg
from flask import Flask, abort, jsonify, request, send_from_directory, session
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash

ROOT = Path(__file__).resolve().parent.parent

KRA_IDS = {
    "instruction": "kra1",
    "research": "kra2",
    "extension": "kra3",
    "professionalDevelopment": "kra4",
}
KRA_INDICATORS = {
    "instruction": "kra1-b-module-sole",
    "research": "kra2-a-journal-sole",
    "extension": "kra3-a-linkage",
    "professionalDevelopment": "kra4-a-member",
}
STATUS_TO_WEB = {
    "validated": "approved",
    "pendingReview": "pending-review",
    "needsRevision": "revision",
    "rejected": "rejected",
}
STATUS_TO_DB = {value: key for key, value in STATUS_TO_WEB.items()}
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

app = Flask(__name__)
app.secret_key = "facultylink-local-secret"
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)


def load_env():
    values = {}
    path = Path(__file__).resolve().parent / ".env"
    if not path.is_file():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def connect():
    settings = load_env()
    return psycopg.connect(
        host=settings.get("PGHOST", "localhost"),
        port=int(settings.get("PGPORT", "5432")),
        dbname=settings.get("PGDATABASE", "facultylink"),
        user=settings.get("PGUSER", "postgres"),
        password=settings.get("PGPASSWORD", ""),
        row_factory=dict_row,
    )


def init_db():
    conn = connect()
    required = {"users", "faculty_profiles", "documents", "notifications", "audit_logs"}
    present = {
        row["table_name"]
        for row in conn.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
    }
    missing = required - present
    if missing:
        conn.close()
        raise RuntimeError("PostgreSQL is missing tables: " + ", ".join(sorted(missing)))
    ensure_kra_settings(conn)
    conn.close()


def display_name(email, profile_name=None):
    if profile_name:
        return profile_name
    local = email.split("@")[0].replace(".", " ").replace("_", " ")
    return " ".join(part.capitalize() for part in local.split())


def web_role(role):
    if role == "admin":
        return "administrator"
    return role


def session_row(conn):
    user_id = session.get("user_id")
    if not user_id:
        return None
    return conn.execute("SELECT * FROM users WHERE id = %s", (user_id,)).fetchone()


def require_user():
    conn = connect()
    user = session_row(conn)
    if not user or user["role"] not in ("admin", "reviewer"):
        conn.close()
        abort(401)
    return conn, user


def json_error(message, status):
    response = jsonify({"error": message})
    response.status_code = status
    return response


def ensure_kra_settings(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS kra_settings (
            id INTEGER PRIMARY KEY,
            payload TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()


def clean_score(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if number != number or number in (float("inf"), float("-inf")) or number < 0 or number > 10000:
        return None
    return round(number, 2)


def sanitize_kra_settings(payload):
    if not isinstance(payload, dict):
        return None
    cleaned = {"kras": {}, "criteria": {}, "indicators": {}}
    fields = {
        "kras": ("maxPoints",),
        "criteria": ("maxPoints",),
        "indicators": ("points", "maxPoints", "multiplier"),
    }
    for bucket, allowed in fields.items():
        incoming = payload.get(bucket) or {}
        if not isinstance(incoming, dict):
            return None
        for item_id, values in incoming.items():
            if not re.fullmatch(r"[a-z0-9-]{1,80}", str(item_id)) or not isinstance(values, dict):
                return None
            item = {}
            for field in allowed:
                if field not in values:
                    continue
                number = clean_score(values[field])
                if number is None:
                    return None
                item[field] = number
            if item:
                cleaned[bucket][item_id] = item
    return cleaned


def read_kra_settings(conn):
    ensure_kra_settings(conn)
    row = conn.execute("SELECT payload FROM kra_settings WHERE id = 1").fetchone()
    if not row:
        return {"kras": {}, "criteria": {}, "indicators": {}}
    try:
        payload = json.loads(row["payload"])
    except (TypeError, ValueError):
        return {"kras": {}, "criteria": {}, "indicators": {}}
    return sanitize_kra_settings(payload) or {"kras": {}, "criteria": {}, "indicators": {}}


def write_kra_settings(conn, settings):
    ensure_kra_settings(conn)
    conn.execute(
        """
        INSERT INTO kra_settings (id, payload, updated_at)
        VALUES (1, %s, %s)
        ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at
        """,
        (json.dumps(settings), datetime.now().isoformat(sep=" ", timespec="seconds")),
    )


def profile_for(conn, user_id):
    return conn.execute("SELECT * FROM faculty_profiles WHERE user_id = %s", (user_id,)).fetchone()


def public_user(conn, row):
    profile = profile_for(conn, row["id"])
    name = display_name(row["email"], profile["full_name"] if profile else None)
    return {
        "id": str(row["id"]),
        "username": row["email"],
        "email": row["email"],
        "role": web_role(row["role"]),
        "name": name,
        "title": "Faculty" if row["role"] == "faculty" else ("Institutional Reviewer" if row["role"] == "reviewer" else "Administrator"),
        "office": profile["department"] if profile else "",
        "department": profile["department"] if profile else "",
        "employeeNo": profile["faculty_id"] if profile else row["email"],
        "contact": profile["phone"] if profile else "",
        "specialization": profile["specialization"] if profile else "",
    }


def sole_reviewer_id(conn):
    rows = conn.execute("SELECT id FROM users WHERE role = 'reviewer'").fetchall()
    if len(rows) == 1:
        return rows[0]["id"]
    return None


def faculty_records(conn):
    people = []
    rows = conn.execute(
        """
        SELECT users.id AS user_id, users.email, faculty_profiles.*
        FROM faculty_profiles
        JOIN users ON users.id = faculty_profiles.user_id
        WHERE users.role = 'faculty'
        ORDER BY faculty_profiles.full_name
        """
    ).fetchall()
    fallback = sole_reviewer_id(conn)
    for row in rows:
        reviewer_id = fallback
        people.append({
            "id": str(row["user_id"]),
            "employeeNo": row["faculty_id"],
            "name": row["full_name"],
            "email": row["email"],
            "department": row["department"],
            "college": row["college"],
            "rank": row["current_rank"],
            "designation": "Faculty",
            "employment": row["employment_status"],
            "dateHired": "",
            "specialization": row["specialization"],
            "education": row["highest_degree"],
            "contact": row["phone"],
            "reviewerId": str(reviewer_id) if reviewer_id else "",
        })
    return people


def document_record(row):
    submitted = str(row["submitted_at"] or "")[:10]
    author = row["author"] or ""
    kra = row["kra"] or ""
    info = row["extracted_info"]
    if not isinstance(info, str):
        info = "" if info is None else str(info)
    text = row["extracted_text"] or row["validation_result"] or row["title"]
    record = {
        "id": row["public_id"],
        "facultyId": str(row["user_id"]),
        "name": row["title"],
        "fileName": row["file_name"] or row["title"],
        "fileType": "PDF",
        "fileSize": "On file",
        "pages": 1,
        "indicatorId": KRA_INDICATORS.get(kra),
        "kraId": KRA_IDS.get(kra, ""),
        "reviewerId": "",
        "dateSubmitted": submitted,
        "hash": row["file_hash"] or "",
        "status": STATUS_TO_WEB.get(row["status"], "pending-review"),
        "databasePoints": row["points"],
        "contribution": [{"author": author or "Faculty", "percent": 100, "subject": True}],
        "ocr": {
            "status": "completed",
            "confidence": 0.9,
            "title": row["title"],
            "authors": [part.strip() for part in author.split(";") if part.strip()] or ["Faculty"],
            "date": submitted,
            "content": " ".join(part for part in [text, info, kra] if part),
        },
        "feedback": row["reviewer_feedback"] or "",
        "decidedAt": None,
    }
    return record


def notification_record(row):
    state = row["visual_state"] or ""
    return {
        "id": row["public_id"],
        "audience": "all",
        "title": (row["kind"] or "Notice").replace("_", " "),
        "body": row["message"],
        "at": str(row["created_at"] or "").replace(" ", "T"),
        "read": state == "read",
        "ref": row["related_document_id"] or row["related_kra"] or "",
    }


def audit_record(row):
    roles = {"admin": "Administrator", "reviewer": "Reviewer", "faculty": "Faculty"}
    return {
        "id": "AUD-" + str(row["id"]),
        "at": str(row["created_at"] or "").replace(" ", "T"),
        "user": row["actor_email"],
        "role": roles.get(row["user_role"] if "user_role" in row.keys() else None, "System"),
        "action": row["action"],
        "ref": row["actor_email"],
        "description": row["detail"] or "",
    }


def visible_faculty_ids(conn, user):
    if user["role"] == "admin":
        return None
    if sole_reviewer_id(conn) != user["id"] and user["role"] != "reviewer":
        return set()
    rows = conn.execute("SELECT user_id FROM faculty_profiles").fetchall()
    return {row["user_id"] for row in rows}


@app.errorhandler(401)
def unauthorized(_error):
    return jsonify({"error": "Sign in is required."}), 401


@app.post("/api/login")
def login():
    payload = request.get_json(silent=True) or {}
    identity = str(payload.get("identity") or "").strip().lower()
    password = str(payload.get("password") or "")
    conn = connect()
    row = conn.execute("SELECT * FROM users WHERE lower(email) = %s", (identity,)).fetchone()
    if not row or not check_password_hash(row["password_hash"], password):
        conn.close()
        return json_error("The username or password is incorrect.", 401)
    if row["role"] == "faculty":
        conn.close()
        return json_error("This portal is for an administrator or reviewer. Faculty accounts stay in the faculty application.", 403)
    if row["role"] not in ("admin", "reviewer"):
        conn.close()
        return json_error("This account cannot open the web portal.", 403)
    session["user_id"] = row["id"]
    session["role"] = row["role"]
    conn.execute(
        "INSERT INTO audit_logs (actor_email, action, detail, created_at) VALUES (%s, %s, %s, %s)",
        (row["email"], "login", "Signed in to the FacultyLink web application.", datetime.now().isoformat(sep=" ", timespec="seconds")),
    )
    conn.commit()
    user = public_user(conn, row)
    conn.close()
    return jsonify({"userId": user["id"], "role": user["role"], "name": user["name"]})


@app.post("/api/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/session")
def current_session():
    conn = connect()
    row = session_row(conn)
    if not row or row["role"] not in ("admin", "reviewer"):
        conn.close()
        return jsonify({"user": None})
    user = public_user(conn, row)
    conn.close()
    return jsonify({"user": {"userId": user["id"], "role": user["role"], "name": user["name"]}})


@app.get("/api/state")
def state():
    conn, user = require_user()
    users = [public_user(conn, row) for row in conn.execute("SELECT * FROM users ORDER BY id")]
    faculty = faculty_records(conn)
    documents = [document_record(row) for row in conn.execute("SELECT * FROM documents ORDER BY id")]
    notifications = [notification_record(row) for row in conn.execute("SELECT * FROM notifications ORDER BY id")]
    audit = [audit_record(row) for row in conn.execute(
        """
        SELECT audit_logs.*, users.role AS user_role
        FROM audit_logs
        LEFT JOIN users ON lower(users.email) = lower(audit_logs.actor_email)
        ORDER BY audit_logs.id
        """
    )]
    allowed = visible_faculty_ids(conn, user)
    kra_settings = read_kra_settings(conn)
    conn.close()
    if allowed is not None:
        faculty = [person for person in faculty if int(person["id"]) in allowed]
        documents = [doc for doc in documents if int(doc["facultyId"]) in allowed]
    return jsonify({
        "users": users,
        "faculty": faculty,
        "documents": documents,
        "notifications": notifications,
        "audit": audit,
        "kraSettings": kra_settings,
    })


@app.put("/api/kra-settings")
def update_kra_settings():
    conn, user = require_user()
    if user["role"] != "admin":
        conn.close()
        return json_error("Only an administrator can change KRA scores.", 403)
    settings = sanitize_kra_settings(request.get_json(silent=True) or {})
    if settings is None:
        conn.close()
        return json_error("Enter scores from 0 through 10000.", 400)
    write_kra_settings(conn, settings)
    conn.execute(
        "INSERT INTO audit_logs (actor_email, action, detail, created_at) VALUES (%s, %s, %s, %s)",
        (
            user["email"],
            "Updated KRA scores",
            "Saved KRA configuration scores used for FacultyLink scoring.",
            datetime.now().isoformat(sep=" ", timespec="seconds"),
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True, "kraSettings": settings})


@app.patch("/api/profile")
def update_profile():
    conn, user = require_user()
    payload = request.get_json(silent=True) or {}
    contact = str(payload.get("contact") or "").strip()
    specialization = str(payload.get("specialization") or "").strip()
    profile = profile_for(conn, user["id"])
    if profile:
        conn.execute(
            "UPDATE faculty_profiles SET phone = %s, specialization = %s WHERE user_id = %s",
            (contact, specialization, user["id"]),
        )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.put("/api/documents/<document_id>")
def update_document(document_id):
    conn, user = require_user()
    row = conn.execute("SELECT * FROM documents WHERE public_id = %s", (document_id,)).fetchone()
    if not row:
        conn.close()
        return json_error("Document not found.", 404)
    allowed = visible_faculty_ids(conn, user)
    if allowed is not None and row["user_id"] not in allowed:
        conn.close()
        return json_error("This document is not assigned to you.", 403)
    incoming = request.get_json(silent=True) or {}
    status = STATUS_TO_DB.get(incoming.get("status"), row["status"])
    feedback = incoming.get("feedback")
    if feedback is None:
        feedback = row["reviewer_feedback"]
    conn.execute(
        """
        UPDATE documents
        SET status = %s, reviewer_feedback = %s, flagged_for_review = %s
        WHERE public_id = %s
        """,
        (status, feedback, status in ("pendingReview", "needsRevision"), document_id),
    )
    conn.commit()
    updated = conn.execute("SELECT * FROM documents WHERE public_id = %s", (document_id,)).fetchone()
    body = document_record(updated)
    conn.close()
    return jsonify(body)


@app.post("/api/faculty/<faculty_id>/reviewer")
def assign_reviewer(faculty_id):
    conn, user = require_user()
    if user["role"] != "admin":
        conn.close()
        return json_error("Only an administrator can assign a reviewer.", 403)
    payload = request.get_json(silent=True) or {}
    try:
        reviewer_id = int(payload.get("reviewerId"))
        faculty_user_id = int(faculty_id)
    except (TypeError, ValueError):
        conn.close()
        return json_error("Faculty or reviewer was not found.", 404)
    reviewer = conn.execute("SELECT id FROM users WHERE id = %s AND role = 'reviewer'", (reviewer_id,)).fetchone()
    person = conn.execute("SELECT user_id FROM faculty_profiles WHERE user_id = %s", (faculty_user_id,)).fetchone()
    if not reviewer or not person:
        conn.close()
        return json_error("Faculty or reviewer was not found.", 404)
    conn.close()
    return jsonify({"ok": True, "reviewerId": reviewer_id, "facultyId": faculty_user_id})


@app.post("/api/notifications")
def create_notification():
    conn, user = require_user()
    payload = request.get_json(silent=True) or {}
    public_id = str(payload.get("id") or "")
    message = str(payload.get("body") or "").strip()
    if not public_id or not message:
        conn.close()
        return json_error("Notification is incomplete.", 400)
    if conn.execute("SELECT id FROM notifications WHERE public_id = %s", (public_id,)).fetchone():
        conn.close()
        return json_error("That notification already exists.", 409)
    targets = conn.execute("SELECT id FROM users WHERE role = 'admin'").fetchall()
    if not targets:
        targets = [user]
    created = str(payload.get("at") or datetime.now().isoformat(sep=" ", timespec="seconds")).replace("T", " ")
    for index, target in enumerate(targets):
        item_id = public_id if index == 0 else public_id + "-" + str(target["id"])
        conn.execute(
            """
            INSERT INTO notifications (
                public_id, user_id, kind, message, created_at, visual_state, related_document_id, related_kra
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (item_id, target["id"], "reviewerFeedback", message, created, "unread", payload.get("ref"), None),
        )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.patch("/api/notifications/<notification_id>")
def mark_notification(notification_id):
    conn, _user = require_user()
    payload = request.get_json(silent=True) or {}
    state = "read" if payload.get("read") else "unread"
    found = conn.execute("UPDATE notifications SET visual_state = %s WHERE public_id = %s", (state, notification_id)).rowcount
    conn.commit()
    conn.close()
    if not found:
        return json_error("Notification not found.", 404)
    return jsonify({"ok": True})


@app.patch("/api/notifications")
def mark_notifications():
    conn, _user = require_user()
    payload = request.get_json(silent=True) or {}
    state = "read" if payload.get("read", True) else "unread"
    for item_id in payload.get("ids") or []:
        conn.execute("UPDATE notifications SET visual_state = %s WHERE public_id = %s", (state, str(item_id)))
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.post("/api/audit")
def create_audit():
    conn, user = require_user()
    payload = request.get_json(silent=True) or {}
    action = str(payload.get("action") or "").strip()
    if not action:
        conn.close()
        return json_error("Audit action is required.", 400)
    detail = payload.get("description") or ""
    ref = payload.get("ref")
    if ref:
        detail = str(ref) + " — " + str(detail)
    conn.execute(
        "INSERT INTO audit_logs (actor_email, action, detail, created_at) VALUES (%s, %s, %s, %s)",
        (user["email"], action, detail, datetime.now().isoformat(sep=" ", timespec="seconds")),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.get("/api/health")
def health():
    conn = connect()
    users = conn.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]
    documents = conn.execute("SELECT COUNT(*) AS total FROM documents").fetchone()["total"]
    conn.close()
    settings = load_env()
    return jsonify({
        "ok": True,
        "database": settings.get("PGDATABASE", "facultylink"),
        "host": settings.get("PGHOST", "localhost"),
        "users": users,
        "documents": documents,
    })


@app.get("/forgot-password")
def forgot_password_page():
    return send_from_directory(ROOT, "forgot-password.html")


@app.post("/api/forgot-password")
def forgot_password():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email") or "").strip().lower()
    if not EMAIL_PATTERN.fullmatch(email) or len(email) > 254:
        return json_error("Enter a valid email address.", 400)
    message = (
        "No reset email was sent. Password recovery by email is not connected yet. "
        "If this address belongs to an administrator or reviewer account, the request is recorded for your institution administrator."
    )
    conn = connect()
    try:
        row = conn.execute(
            "SELECT email, role FROM users WHERE lower(email) = %s",
            (email,),
        ).fetchone()
        if row and row["role"] in ("admin", "reviewer"):
            conn.execute(
                "INSERT INTO audit_logs (actor_email, action, detail, created_at) VALUES (%s, %s, %s, %s)",
                (
                    row["email"],
                    "Requested password reset",
                    "Requested a password reset from the web portal. No reset email was sent.",
                    datetime.now().isoformat(sep=" ", timespec="seconds"),
                ),
            )
            conn.commit()
    finally:
        conn.close()
    return jsonify({"ok": True, "emailSent": False, "message": message})


@app.get("/")
def home():
    return send_from_directory(ROOT, "index.html")


@app.get("/<path:filename>")
def assets(filename):
    if filename.startswith("backend") or filename.startswith("_") or ".." in filename.replace("\\", "/").split("/"):
        abort(404)
    target = (ROOT / filename).resolve()
    if ROOT not in target.parents or not target.is_file():
        abort(404)
    return send_from_directory(target.parent, target.name)


init_db()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8765, debug=False)
