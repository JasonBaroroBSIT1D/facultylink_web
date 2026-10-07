"""FacultyLink web backend.

Flask serves the Administrator and Reviewer pages and reads the SQLite
database supplied with the project. Passwords stay as the hashes already
stored in that file. Faculty rows, documents, notifications, KRA scores,
and the audit log are the tables already in the database.
"""

import json
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(__file__).resolve().parent / "data"
DB_PATH = DATA_DIR / "facultylink.db"
SOURCE_DB = Path(r"c:\Users\gumat\Downloads\facultylink.db")

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

app = Flask(__name__)
app.secret_key = "facultylink-local-secret"
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
)


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def columns(conn, table):
    return [row[1] for row in conn.execute(f"PRAGMA table_info({table})")]


def init_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DB_PATH.exists():
        if not SOURCE_DB.exists():
            raise FileNotFoundError("facultylink.db was not found in Downloads.")
        shutil.copy(SOURCE_DB, DB_PATH)
    conn = connect()
    if "reviewer_user_id" not in columns(conn, "faculty_profiles"):
        conn.execute("ALTER TABLE faculty_profiles ADD COLUMN reviewer_user_id INTEGER")
    if "web_payload" not in columns(conn, "documents"):
        conn.execute("ALTER TABLE documents ADD COLUMN web_payload TEXT")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS web_profiles (
            user_id INTEGER PRIMARY KEY,
            office TEXT,
            contact TEXT,
            specialization TEXT
        )
        """
    )
    conn.commit()
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
    return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


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


def profile_for(conn, user_id):
    return conn.execute("SELECT * FROM faculty_profiles WHERE user_id = ?", (user_id,)).fetchone()


def web_profile(conn, user_id):
    return conn.execute("SELECT * FROM web_profiles WHERE user_id = ?", (user_id,)).fetchone()


def public_user(conn, row):
    profile = profile_for(conn, row["id"])
    extra = web_profile(conn, row["id"])
    name = display_name(row["email"], profile["full_name"] if profile else None)
    return {
        "id": str(row["id"]),
        "username": row["email"],
        "email": row["email"],
        "role": web_role(row["role"]),
        "name": name,
        "title": "Faculty" if row["role"] == "faculty" else ("Institutional Reviewer" if row["role"] == "reviewer" else "Administrator"),
        "office": (extra["office"] if extra and extra["office"] else (profile["department"] if profile else "")),
        "department": profile["department"] if profile else "",
        "employeeNo": profile["faculty_id"] if profile else row["email"],
        "contact": (extra["contact"] if extra and extra["contact"] else (profile["phone"] if profile else "")),
        "specialization": (extra["specialization"] if extra and extra["specialization"] else (profile["specialization"] if profile else "")),
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
        reviewer_id = row["reviewer_user_id"] or fallback
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
    extra = {}
    if row["web_payload"]:
        try:
            extra = json.loads(row["web_payload"])
        except json.JSONDecodeError:
            extra = {}
    submitted = str(row["submitted_at"] or "")[:10]
    author = row["author"] or ""
    kra = row["kra"] or ""
    info = row["extracted_info"] or ""
    text = row["extracted_text"] or row["validation_result"] or row["title"]
    record = {
        "id": row["public_id"],
        "facultyId": str(row["user_id"]),
        "name": row["title"],
        "fileName": row["file_name"] or row["title"],
        "fileType": "PDF",
        "fileSize": "On file",
        "pages": 1,
        "indicatorId": extra.get("indicatorId") or KRA_INDICATORS.get(kra),
        "kraId": KRA_IDS.get(kra, ""),
        "reviewerId": extra.get("reviewerId") or "",
        "dateSubmitted": submitted,
        "hash": row["file_hash"] or "",
        "status": STATUS_TO_WEB.get(row["status"], "pending-review"),
        "databasePoints": row["points"],
        "contribution": extra.get("contribution") or [{"author": author or "Faculty", "percent": 100, "subject": True}],
        "ocr": {
            "status": "completed",
            "confidence": 0.9,
            "title": row["title"],
            "authors": [part.strip() for part in author.split(";") if part.strip()] or ["Faculty"],
            "date": submitted,
            "content": " ".join(part for part in [text, info, kra] if part),
        },
        "feedback": row["reviewer_feedback"] or "",
        "decidedAt": extra.get("decidedAt"),
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
    fallback = sole_reviewer_id(conn)
    ids = []
    for row in conn.execute("SELECT user_id, reviewer_user_id FROM faculty_profiles"):
        assigned = row["reviewer_user_id"] or fallback
        if assigned == user["id"]:
            ids.append(row["user_id"])
    return set(ids)


@app.errorhandler(401)
def unauthorized(_error):
    return jsonify({"error": "Sign in is required."}), 401


@app.post("/api/login")
def login():
    payload = request.get_json(silent=True) or {}
    identity = str(payload.get("identity") or "").strip().lower()
    password = str(payload.get("password") or "")
    conn = connect()
    row = conn.execute("SELECT * FROM users WHERE lower(email) = ?", (identity,)).fetchone()
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
        "INSERT INTO audit_logs (actor_email, action, detail, created_at) VALUES (?, ?, ?, ?)",
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
    })


@app.patch("/api/profile")
def update_profile():
    conn, user = require_user()
    payload = request.get_json(silent=True) or {}
    office = str(payload.get("office") or "").strip()
    contact = str(payload.get("contact") or "").strip()
    specialization = str(payload.get("specialization") or "").strip()
    conn.execute(
        """
        INSERT INTO web_profiles (user_id, office, contact, specialization)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            office = excluded.office,
            contact = excluded.contact,
            specialization = excluded.specialization
        """,
        (user["id"], office, contact, specialization),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.put("/api/documents/<document_id>")
def update_document(document_id):
    conn, user = require_user()
    row = conn.execute("SELECT * FROM documents WHERE public_id = ?", (document_id,)).fetchone()
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
    payload = {
        "indicatorId": incoming.get("indicatorId"),
        "reviewerId": str(user["id"]),
        "decidedAt": incoming.get("decidedAt"),
        "contribution": incoming.get("contribution"),
    }
    conn.execute(
        """
        UPDATE documents
        SET status = ?, reviewer_feedback = ?, web_payload = ?
        WHERE public_id = ?
        """,
        (status, feedback, json.dumps(payload), document_id),
    )
    conn.commit()
    updated = conn.execute("SELECT * FROM documents WHERE public_id = ?", (document_id,)).fetchone()
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
    reviewer = conn.execute("SELECT id FROM users WHERE id = ? AND role = 'reviewer'", (reviewer_id,)).fetchone()
    person = conn.execute("SELECT user_id FROM faculty_profiles WHERE user_id = ?", (faculty_user_id,)).fetchone()
    if not reviewer or not person:
        conn.close()
        return json_error("Faculty or reviewer was not found.", 404)
    conn.execute(
        "UPDATE faculty_profiles SET reviewer_user_id = ? WHERE user_id = ?",
        (reviewer_id, faculty_user_id),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.post("/api/notifications")
def create_notification():
    conn, user = require_user()
    payload = request.get_json(silent=True) or {}
    public_id = str(payload.get("id") or "")
    message = str(payload.get("body") or "").strip()
    if not public_id or not message:
        conn.close()
        return json_error("Notification is incomplete.", 400)
    if conn.execute("SELECT id FROM notifications WHERE public_id = ?", (public_id,)).fetchone():
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    found = conn.execute("UPDATE notifications SET visual_state = ? WHERE public_id = ?", (state, notification_id)).rowcount
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
        conn.execute("UPDATE notifications SET visual_state = ? WHERE public_id = ?", (state, str(item_id)))
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
        "INSERT INTO audit_logs (actor_email, action, detail, created_at) VALUES (?, ?, ?, ?)",
        (user["email"], action, detail, datetime.now().isoformat(sep=" ", timespec="seconds")),
    )
    conn.commit()
    conn.close()
    return jsonify({"ok": True})


@app.get("/api/health")
def health():
    conn = connect()
    users = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    documents = conn.execute("SELECT COUNT(*) FROM documents").fetchone()[0]
    conn.close()
    return jsonify({"ok": True, "users": users, "documents": documents})


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
