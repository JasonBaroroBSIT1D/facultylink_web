window.FL = window.FL || {};

FL.auth = {
  sessionKey: "facultylink.session",
  rememberKey: "facultylink.remember",

  current: function () {
    try {
      return JSON.parse(sessionStorage.getItem(this.sessionKey) || "null");
    } catch (error) {
      return null;
    }
  },

  home: function (role) {
    const here = window.location.pathname.replace(/\\/g, "/");
    const inFolder = /\/(admin|reviewer)\//.test(here);
    const prefix = inFolder ? "../" : "";
    if (role === "administrator") return prefix + "admin/dashboard.html";
    if (role === "reviewer") return prefix + "reviewer/dashboard.html";
    return prefix + "login.html";
  },

  loginUrl: function () {
    const here = window.location.pathname.replace(/\\/g, "/");
    return /\/(admin|reviewer)\//.test(here) ? "../login.html" : "login.html";
  },

  require: function (role) {
    FL.store.init();
    const session = this.current();
    if (!session || !FL.store.userById(session.userId)) {
      window.location.replace(this.loginUrl());
      return null;
    }
    if (role && session.role !== role) {
      window.location.replace(this.home(session.role));
      return null;
    }
    return session;
  },

  signIn: function (identity, password) {
    const key = identity.trim().toLowerCase();
    const user = FL.seed.users.find(function (item) {
      return item.username.toLowerCase() === key || item.email.toLowerCase() === key;
    });
    if (!user || user.password !== password) return null;
    const session = { userId: user.id, role: user.role, name: user.name, at: new Date().toISOString() };
    sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
    return session;
  },

  signOut: function () {
    sessionStorage.removeItem(this.sessionKey);
    window.location.href = this.loginUrl();
  }
};

FL.pages = FL.pages || {};
FL.pages.login = function () {
  const existing = FL.auth.current();
  if (existing && FL.seed.users.some(function (user) { return user.id === existing.userId; })) {
    window.location.replace(FL.auth.home(existing.role));
    return;
  }
  const form = document.getElementById("login-form");
  const identity = document.getElementById("identity");
  const password = document.getElementById("password");
  const identityError = document.getElementById("identity-error");
  const passwordError = document.getElementById("password-error");
  const formError = document.getElementById("form-error");
  const submit = document.getElementById("sign-in");
  const toggle = document.getElementById("toggle-password");
  const remember = document.getElementById("remember");
  const saved = localStorage.getItem(FL.auth.rememberKey);
  if (saved) {
    identity.value = saved;
    remember.checked = true;
  }
  toggle.addEventListener("click", function () {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    toggle.classList.toggle("is-visible", show);
    toggle.setAttribute("aria-pressed", show ? "true" : "false");
    toggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    identityError.textContent = "";
    passwordError.textContent = "";
    formError.hidden = true;
    let invalid = false;
    if (!identity.value.trim()) {
      identityError.textContent = "Email address is required.";
      invalid = true;
    }
    if (!password.value) {
      passwordError.textContent = "Password is required.";
      invalid = true;
    }
    if (invalid) return;
    submit.disabled = true;
    submit.innerHTML = '<span class="spinner" aria-hidden="true"></span> Signing in';
    window.setTimeout(function () {
      const session = FL.auth.signIn(identity.value, password.value);
      if (!session) {
        submit.disabled = false;
        submit.textContent = "Sign in";
        formError.hidden = false;
        formError.textContent = "The username or password is incorrect.";
        return;
      }
      if (remember.checked) localStorage.setItem(FL.auth.rememberKey, identity.value.trim());
      else localStorage.removeItem(FL.auth.rememberKey);
      FL.store.init();
      const user = FL.store.userById(session.userId);
      FL.audit.record(user, "Signed in", user.employeeNo, "Signed in to the FacultyLink web application.");
      formError.hidden = true;
      submit.classList.add("is-success");
      submit.textContent = "Signed in";
      const success = document.getElementById("login-success");
      success.hidden = false;
      window.setTimeout(function () {
        window.location.href = FL.auth.home(session.role);
      }, 500);
    }, 450);
  });
  document.getElementById("about-link").addEventListener("click", function () {
    FL.ui.modal({
      title: "About FacultyLink",
      body: "<p>FacultyLink is an intelligent document-validated faculty self-assessment system for DBM–CHED Joint Circular rank upgrade and reclassification.</p><p>It supports document validation, KRA scoring, compliance monitoring, reviewer feedback, and rank upgrade simulation for State Universities and Colleges.</p><p>FacultyLink prepares and supports evaluation. It does not replace the official evaluation of authorized committees or the SUC governing board.</p>",
      cancelLabel: "Close"
    });
  });
  document.getElementById("forgot-password").addEventListener("click", function () {
    FL.ui.modal({
      title: "Forgot password",
      body: "<p>Password assistance is handled by the institution administrator. Use the Administrator or Reviewer account issued for FacultyLink.</p>",
      cancelLabel: "Close"
    });
  });
  document.getElementById("help-link").addEventListener("click", function () {
    FL.ui.modal({
      title: "Help",
      body: "<p>Sign in with the email address and password issued for an Administrator or Reviewer account. The email field also accepts the assigned username.</p>",
      cancelLabel: "Close"
    });
  });
  document.getElementById("support-link").addEventListener("click", function () {
    FL.ui.modal({
      title: "Support",
      body: "<p>For account access, contact the institution administrator.</p>",
      cancelLabel: "Close"
    });
  });
  document.getElementById("contact-admin").addEventListener("click", function () {
    FL.ui.modal({
      title: "Contact institution admin",
      body: "<p>New Administrator and Reviewer accounts are issued by the institution. Contact the Office of the Vice President for Academic Affairs.</p>",
      cancelLabel: "Close"
    });
  });
};
