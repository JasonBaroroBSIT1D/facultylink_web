window.FL = window.FL || {};

FL.admin = {
  validationCounts: function () {
    const counts = { valid: 0, invalid: 0, "reviewer-required": 0 };
    FL.store.documents.forEach(function (doc) {
      const overall = FL.validation.evaluate(doc).overall;
      counts[overall] = (counts[overall] || 0) + 1;
    });
    return counts;
  },

  renderDashboard: function () {
    const faculty = FL.store.faculty;
    const docs = FL.store.documents;
    const pending = docs.filter(function (doc) { return doc.status === "pending-review" || doc.status === "reviewer-required" || doc.status === "invalid"; }).length;
    const approved = docs.filter(function (doc) { return doc.status === "approved"; }).length;
    const attention = faculty.filter(function (person) { return FL.compliance(person.id).status !== "On track"; }).length;
    const counts = FL.admin.validationCounts();
    const kraBars = FL.rules.kras.map(function (kra) {
      const total = faculty.reduce(function (sum, person) {
        const row = FL.scoring.simulation(person.id).aggregate.kras.find(function (item) { return item.id === kra.id; });
        return sum + (row ? row.earned : 0);
      }, 0);
      const average = faculty.length ? FL.scoring.round(total / faculty.length) : 0;
      return { label: kra.code, average: average, max: kra.maxPoints };
    });
    const maxAverage = Math.max.apply(null, kraBars.map(function (bar) { return bar.max; }));
    document.getElementById("page").innerHTML = `
      <div class="page-head">
        <div>
          <p class="eyebrow">${FL.esc(FL.institution.name)}</p>
          <h1>Administrator Dashboard</h1>
          <p class="lede">Faculty readiness, document validation, KRA estimates, reviewer activity, and compliance under DBM–CHED Joint Circular No. 3, s. 2022.</p>
        </div>
      </div>
      <div class="stat-grid">
        <article class="stat"><span>Faculty</span><strong>${faculty.length}</strong><small>${attention} need attention</small></article>
        <article class="stat"><span>Documents</span><strong>${docs.length}</strong><small>${approved} approved</small></article>
        <article class="stat"><span>Awaiting validation</span><strong>${pending}</strong><small>Invalid, unclassified, or in queue</small></article>
        <article class="stat"><span>Valid documents</span><strong>${counts.valid}</strong><small>${counts.invalid} invalid · ${counts["reviewer-required"]} for reviewer</small></article>
      </div>
      <div class="split">
        <article class="card">
          <div class="card-head"><h2>KRA estimates</h2></div>
          <div class="bars">${kraBars.map(function (bar) {
            const width = Math.round((bar.average / maxAverage) * 100);
            return `<div class="bar-row"><span>${FL.esc(bar.label)}</span><div class="track"><span style="width:${width}%"></span></div><strong>${bar.average}</strong></div>`;
          }).join("")}</div>
          <p class="note">Average approved points per faculty. Each KRA maximum is 100, before any bonus points stated in the circular.</p>
        </article>
        <article class="card">
          <div class="card-head"><h2>Validation</h2></div>
          <div class="bars">
            <div class="bar-row"><span>Valid</span><div class="track"><span class="ok" style="width:${docs.length ? (counts.valid / docs.length) * 100 : 0}%"></span></div><strong>${counts.valid}</strong></div>
            <div class="bar-row"><span>Reviewer</span><div class="track"><span class="warn" style="width:${docs.length ? (counts["reviewer-required"] / docs.length) * 100 : 0}%"></span></div><strong>${counts["reviewer-required"]}</strong></div>
            <div class="bar-row"><span>Invalid</span><div class="track"><span class="bad" style="width:${docs.length ? (counts.invalid / docs.length) * 100 : 0}%"></span></div><strong>${counts.invalid}</strong></div>
          </div>
        </article>
      </div>
      <article class="card">
        <div class="card-head"><h2>Compliance monitoring</h2><a href="reports.html">Open reports</a></div>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Faculty</th><th>Rank</th><th>Submitted</th><th>Validated</th><th>Missing or held</th><th>Revision</th><th>KRA progress</th><th>Status</th></tr></thead>
          <tbody>${faculty.map(function (person) {
            const item = FL.compliance(person.id);
            const sim = FL.scoring.simulation(person.id);
            return `<tr>
              <td><a href="faculty-detail.html?id=${FL.esc(person.id)}">${FL.esc(person.name)}</a></td>
              <td>${FL.esc(person.rank)}</td>
              <td>${item.submitted}</td>
              <td>${item.validated}</td>
              <td>${item.missing}</td>
              <td>${item.revision}</td>
              <td class="progress-cell">${FL.ui.progress(sim.aggregate.kras.filter(function (kra) { return kra.earned > 0; }).length, 4, "")}</td>
              <td>${FL.ui.statusBadge(item.status)}</td>
            </tr>`;
          }).join("")}</tbody>
        </table></div>
      </article>
      <div class="split">
        <article class="card">
          <div class="card-head"><h2>Recent documents</h2><a href="documents.html">All documents</a></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Document</th><th>Faculty</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>${docs.slice().sort(function (a, b) { return a.dateSubmitted < b.dateSubmitted ? 1 : -1; }).slice(0, 6).map(function (doc) {
              const person = FL.store.facultyById(doc.facultyId);
              return `<tr><td><a href="document-view.html?id=${FL.esc(doc.id)}">${FL.esc(doc.id)}</a><div class="sub">${FL.esc(doc.name)}</div></td><td>${FL.esc(person ? person.name : "")}</td><td>${FL.ui.statusBadge(doc.status)}</td><td>${FL.esc(FL.formatWhen(doc.dateSubmitted))}</td></tr>`;
            }).join("")}</tbody>
          </table></div>
        </article>
        <article class="card">
          <div class="card-head"><h2>Reviewer activity</h2><a href="reviewers.html">Manage reviewers</a></div>
          <ul class="activity">${FL.store.users.filter(function (user) { return user.role === "reviewer"; }).map(function (reviewer) {
            const assigned = FL.store.faculty.filter(function (person) { return person.reviewerId === reviewer.id; }).length;
            const open = FL.store.documents.filter(function (doc) { return doc.reviewerId === reviewer.id && FL.documents.needsAction(doc); }).length;
            return `<li><strong>${FL.esc(reviewer.name)}</strong><span>${assigned} faculty · ${open} documents needing action</span></li>`;
          }).join("")}</ul>
        </article>
      </div>`;
  },

  renderReviewers: function (session) {
    const page = document.getElementById("page");
    const draw = function () {
      const query = (document.getElementById("reviewer-search").value || "").trim().toLowerCase();
      const reviewers = FL.store.users.filter(function (user) {
        if (user.role !== "reviewer") return false;
        if (!query) return true;
        const facultyNames = FL.store.faculty.filter(function (person) { return person.reviewerId === user.id; }).map(function (person) { return person.name; }).join(" ");
        return (user.name + " " + user.department + " " + facultyNames).toLowerCase().indexOf(query) !== -1;
      });
      const host = document.getElementById("reviewer-table");
      if (!reviewers.length) {
        host.innerHTML = FL.ui.empty("No reviewers", "No reviewer matches this search.");
        return;
      }
      host.innerHTML = `<table class="data"><thead><tr><th>Reviewer</th><th>Assigned faculty</th><th>Assigned documents</th><th>Review status</th><th></th></tr></thead><tbody>
        ${reviewers.map(function (reviewer) {
          const people = FL.store.faculty.filter(function (person) { return person.reviewerId === reviewer.id; });
          const documents = FL.store.documents.filter(function (doc) { return doc.reviewerId === reviewer.id; });
          const open = documents.filter(FL.documents.needsAction).length;
          return `<tr>
            <td><strong>${FL.esc(reviewer.name)}</strong><div class="sub">${FL.esc(reviewer.department)}</div></td>
            <td>${people.length}</td>
            <td>${documents.length}</td>
            <td>${open ? FL.ui.badge("pending", open + " open") : FL.ui.badge("valid", "No open items")}</td>
            <td class="action-cell">
              <button class="btn btn-small btn-ghost" type="button" data-view="${FL.esc(reviewer.id)}">View assigned work</button>
              <button class="btn btn-small btn-primary" type="button" data-assign="${FL.esc(reviewer.id)}">Assign / Reassign</button>
            </td>
          </tr>`;
        }).join("")}
      </tbody></table>`;
      host.querySelectorAll("[data-view]").forEach(function (button) {
        button.addEventListener("click", function () { FL.admin.viewWork(button.getAttribute("data-view")); });
      });
      host.querySelectorAll("[data-assign]").forEach(function (button) {
        button.addEventListener("click", function () { FL.admin.assign(session, button.getAttribute("data-assign"), draw); });
      });
    };
    page.innerHTML = `
      <div class="page-head"><div>
        <p class="eyebrow">Assignments</p>
        <h1>Reviewers</h1>
        <p class="lede">Assign and reassign faculty to institutional reviewers. Open items stay with the reviewer until a decision is recorded.</p>
      </div></div>
      <div class="toolbar"><label class="search"><span class="sr-only">Search reviewers</span><input id="reviewer-search" type="search" placeholder="Search reviewers or assigned faculty"></label></div>
      <div class="card"><div class="table-wrap" id="reviewer-table"></div></div>`;
    document.getElementById("reviewer-search").addEventListener("input", draw);
    draw();
  },

  viewWork: function (reviewerId) {
    const reviewer = FL.store.userById(reviewerId);
    const people = FL.store.faculty.filter(function (person) { return person.reviewerId === reviewerId; });
    const body = people.length ? `<ul class="plain">${people.map(function (person) {
      const docs = FL.store.documents.filter(function (doc) { return doc.facultyId === person.id; });
      return `<li><a href="faculty-detail.html?id=${FL.esc(person.id)}">${FL.esc(person.name)}</a> — ${docs.length} documents</li>`;
    }).join("")}</ul>` : "<p>No faculty are assigned.</p>";
    FL.ui.modal({ title: reviewer.name, body: body, cancelLabel: "Close" });
  },

  assign: function (session, reviewerId, redraw) {
    const reviewer = FL.store.userById(reviewerId);
    const options = FL.store.faculty.map(function (person) {
      const current = FL.store.userById(person.reviewerId);
      return `<option value="${FL.esc(person.id)}">${FL.esc(person.name)} — ${FL.esc(current ? current.name : "Unassigned")}</option>`;
    }).join("");
    FL.ui.modal({
      title: "Assign faculty to " + reviewer.name,
      body: `<label class="field"><span>Faculty</span><select id="assign-faculty">${options}</select></label><p class="note">Reassignment moves open documents to this reviewer.</p>`,
      confirmLabel: "Assign",
      onConfirm: function () {
        const facultyId = document.getElementById("assign-faculty").value;
        const person = FL.store.facultyById(facultyId);
        FL.store.assignReviewer(facultyId, reviewerId);
        const admin = FL.store.userById(session.userId);
        FL.audit.record(admin, "Reassigned reviewer", person.id, "Assigned " + person.name + " to " + reviewer.name + ".");
        FL.ui.toast("Assignment saved.", "ok");
        redraw();
      }
    });
  },

  renderKra: function () {
    const page = document.getElementById("page");
    page.innerHTML = `
      <div class="page-head"><div>
        <p class="eyebrow">${FL.esc(FL.rules.citation)}</p>
        <h1>KRA Configuration</h1>
        <p class="lede">Predefined evaluation rules from ${FL.esc(FL.rules.annex)}. ${FL.esc(FL.scoring.formula)}</p>
      </div></div>
      <div class="callout"><strong>Rule source</strong><p>${FL.rules.globalConditions.map(FL.esc).join(" ")}</p></div>
      <div class="toolbar"><label class="search"><span class="sr-only">Search rules</span><input id="rule-search" type="search" placeholder="Search KRA, criterion, indicator, or evidence"></label></div>
      <div id="rule-list" class="stack"></div>`;
    const draw = function () {
      const query = document.getElementById("rule-search").value.trim().toLowerCase();
      const blocks = [];
      FL.rules.kras.forEach(function (kra) {
        kra.criteria.forEach(function (criterion) {
          const indicators = criterion.indicators.filter(function (indicator) {
            if (!query) return true;
            return [kra.name, kra.code, criterion.name, indicator.name, (indicator.evidence || []).join(" "), (indicator.conditions || []).join(" ")].join(" ").toLowerCase().indexOf(query) !== -1;
          });
          if (!indicators.length) return;
          blocks.push(`<article class="card">
            <div class="card-head"><h2>${FL.esc(kra.code)} — ${FL.esc(criterion.name)}</h2><span>Maximum ${criterion.maxPoints}${criterion.bonus ? " bonus" : ""}</span></div>
            <p>${FL.esc(criterion.description || kra.summary)}</p>
            <div class="table-wrap"><table class="data">
              <thead><tr><th>Indicator</th><th>Points</th><th>Maximum</th><th>Documentary evidence</th><th>Contribution / conditions</th></tr></thead>
              <tbody>${indicators.map(function (indicator) {
                return `<tr>
                  <td>${FL.esc(indicator.name)}</td>
                  <td>${FL.esc(indicator.pointsLabel || (indicator.points == null ? "—" : String(indicator.points)))}</td>
                  <td>${FL.esc(String(indicator.maxPoints))}</td>
                  <td>${FL.esc(indicator.evidence.join("; "))}</td>
                  <td>${FL.esc(FL.documents.contributionNote(indicator))} ${FL.esc(indicator.conditions[0] || "")}</td>
                </tr>`;
              }).join("")}</tbody>
            </table></div>
          </article>`);
        });
      });
      document.getElementById("rule-list").innerHTML = blocks.length ? blocks.join("") : FL.ui.empty("No rules", "No indicator matches this search.");
    };
    document.getElementById("rule-search").addEventListener("input", draw);
    draw();
  },

  renderReports: function () {
    const page = document.getElementById("page");
    const colleges = {};
    FL.store.faculty.forEach(function (person) { colleges[person.college] = true; });
    page.innerHTML = `
      <div class="page-head"><div>
        <p class="eyebrow">Reports and analytics</p>
        <h1>Reports & Analytics</h1>
        <p class="lede">Faculty readiness, KRA scores, submissions, validation, compliance, and evaluation-support results.</p>
      </div></div>
      <div class="toolbar">
        <label class="filter"><span>College</span>
          <select id="report-college"><option value="">All colleges</option>${Object.keys(colleges).sort().map(function (college) {
            return `<option>${FL.esc(college)}</option>`;
          }).join("")}</select>
        </label>
      </div>
      <div id="report-body"></div>`;
    const draw = function () {
      const college = document.getElementById("report-college").value;
      const faculty = FL.store.faculty.filter(function (person) { return !college || person.college === college; });
      const ids = {};
      faculty.forEach(function (person) { ids[person.id] = true; });
      const docs = FL.store.documents.filter(function (doc) { return ids[doc.facultyId]; });
      const statusCounts = {};
      docs.forEach(function (doc) { statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1; });
      document.getElementById("report-body").innerHTML = `
        <div class="stat-grid">
          <article class="stat"><span>Faculty in view</span><strong>${faculty.length}</strong></article>
          <article class="stat"><span>Document submissions</span><strong>${docs.length}</strong></article>
          <article class="stat"><span>Approved</span><strong>${statusCounts.approved || 0}</strong></article>
          <article class="stat"><span>Needs attention</span><strong>${faculty.filter(function (person) { return FL.compliance(person.id).status !== "On track"; }).length}</strong></article>
        </div>
        <article class="card">
          <div class="card-head"><h2>Faculty readiness</h2></div>
          <div class="table-wrap"><table class="data">
            <thead><tr><th>Faculty</th><th>College</th><th>Rank</th><th>KRA I</th><th>KRA II</th><th>KRA III</th><th>KRA IV</th><th>Computed score</th><th>Compliance</th></tr></thead>
            <tbody>${faculty.map(function (person) {
              const sim = FL.scoring.simulation(person.id);
              const cells = sim.aggregate.kras.map(function (kra) { return `<td>${kra.earned}${kra.bonus ? "+" + kra.bonus : ""}</td>`; }).join("");
              return `<tr><td>${FL.esc(person.name)}</td><td>${FL.esc(person.college)}</td><td>${FL.esc(person.rank)}</td>${cells}<td>${sim.aggregate.total}</td><td>${FL.ui.statusBadge(FL.compliance(person.id).status)}</td></tr>`;
            }).join("")}</tbody>
          </table></div>
          <p class="note">Scores are simulation estimates from approved documents. They are not the official sub-rank result.</p>
        </article>
        <article class="card">
          <div class="card-head"><h2>Document validation and submissions</h2></div>
          <div class="bars">${Object.keys(statusCounts).map(function (status) {
            const width = docs.length ? (statusCounts[status] / docs.length) * 100 : 0;
            return `<div class="bar-row"><span>${FL.esc(status)}</span><div class="track"><span style="width:${width}%"></span></div><strong>${statusCounts[status]}</strong></div>`;
          }).join("")}</div>
        </article>`;
    };
    document.getElementById("report-college").addEventListener("change", draw);
    draw();
  },

  renderProfile: function (session) {
    const user = FL.store.userById(session.userId);
    const page = document.getElementById("page");
    page.innerHTML = `
      <div class="page-head"><div><p class="eyebrow">Account</p><h1>My Profile</h1><p class="lede">Administrator account for FacultyLink evaluation support.</p></div></div>
      <article class="card profile-card">
        <div class="profile-banner"><span class="avatar large">${FL.esc(user.name.split(" ").map(function (part) { return part[0]; }).slice(0, 2).join(""))}</span><div><h2>${FL.esc(user.name)}</h2><p>${FL.esc(user.title)}</p>${FL.ui.badge("info", "Administrator")}</div></div>
        <form id="profile-form" class="form-grid">
          <label class="field"><span>Employee number</span><input value="${FL.esc(user.employeeNo)}" disabled></label>
          <label class="field"><span>Email</span><input value="${FL.esc(user.email)}" disabled></label>
          <label class="field"><span>Office</span><input id="profile-office" value="${FL.esc(user.office)}"></label>
          <label class="field"><span>Contact</span><input id="profile-contact" value="${FL.esc(user.contact)}"></label>
          <label class="field field-wide"><span>Assignment</span><input id="profile-spec" value="${FL.esc(user.specialization)}"></label>
          <div class="field-wide"><button class="btn btn-primary" type="submit">Save profile</button></div>
        </form>
      </article>`;
    document.getElementById("profile-form").addEventListener("submit", function (event) {
      event.preventDefault();
      user.office = document.getElementById("profile-office").value.trim();
      user.contact = document.getElementById("profile-contact").value.trim();
      user.specialization = document.getElementById("profile-spec").value.trim();
      FL.store.persist();
      FL.audit.record(user, "Updated profile", user.employeeNo, "Updated administrator profile details.");
      FL.ui.toast("Profile updated for this session.", "ok");
    });
  }
};

FL.pages["admin-dashboard"] = function () { FL.admin.renderDashboard(); };
FL.pages["admin-reviewers"] = function (session) { FL.admin.renderReviewers(session); };
FL.pages["admin-kra"] = function () { FL.admin.renderKra(); };
FL.pages["admin-reports"] = function () { FL.admin.renderReports(); };
FL.pages["admin-profile"] = function (session) { FL.admin.renderProfile(session); };
FL.pages["admin-notifications"] = function (session) {
  const user = FL.store.userById(session.userId);
  const draw = function () {
    document.getElementById("page").innerHTML = FL.notifications.render(user);
    FL.notifications.bind(user, draw);
  };
  draw();
};
FL.pages["admin-audit"] = function () {
  document.getElementById("page").innerHTML = FL.audit.render();
  FL.audit.bind();
};
