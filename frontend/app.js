const TOKEN_KEY = "portfolio_admin_token";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  initContinuousTypewriter("nav-typewriter", ["Sneha.dev", "SnehaChowdhury"], 140, 90, 2400);
  initContinuousTypewriter("hero-typewriter", [
    "Full-Stack Web & Software Developer",
    "Machine Learning & AI Enthusiast"
  ], 85, 40, 2000);

  // Initialize UI based on current session
  refreshAuthState();
  fetchProjects();
  fetchPosts();
});

// Refresh view: Guest by default, Admin if valid token is stored
function refreshAuthState() {
  const token = localStorage.getItem(TOKEN_KEY);
  const projBtn = document.getElementById("proj-publish-btn");
  const postBtn = document.getElementById("post-publish-btn");
  const loginNavBtn = document.getElementById("nav-login-btn");
  const adminBadge = document.getElementById("admin-status-badge");

  if (token) {
    // Admin Mode Unlocked
    projBtn.classList.remove("hidden");
    postBtn.classList.remove("hidden");
    adminBadge.classList.remove("hidden");
    loginNavBtn.classList.add("hidden");
  } else {
    // Default Guest Mode (View Only)
    projBtn.classList.add("hidden");
    postBtn.classList.add("hidden");
    adminBadge.classList.add("hidden");
    loginNavBtn.classList.remove("hidden");
  }
}

// Modal Controllers
window.openLoginModal = function() {
  document.getElementById("login-modal").classList.remove("hidden");
  document.getElementById("gate-error").classList.add("hidden");
};

window.closeLoginModal = function() {
  document.getElementById("login-modal").classList.add("hidden");
  document.getElementById("gate-error").classList.add("hidden");
  document.getElementById("admin-auth-form").reset();
};

window.openModal = function(id) {
  document.getElementById(id).classList.remove("hidden");
};

window.closeModal = function(id) {
  document.getElementById(id).classList.add("hidden");
};

// Admin Login Handler
window.handleAdminLogin = async function(event) {
  event.preventDefault();
  const errorEl = document.getElementById("gate-error");
  const submitBtn = document.getElementById("submit-login-btn");
  errorEl.classList.add("hidden");
  submitBtn.disabled = true;
  submitBtn.textContent = "Verifying...";

  const username = document.getElementById("gate-user").value.trim();
  const password = document.getElementById("gate-pass").value;

  try {
    const response = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    
    closeLoginModal();
    refreshAuthState();
    fetchProjects();
    fetchPosts();
  } catch (err) {
    // On failure: remain in guest mode and display clear error
    errorEl.classList.remove("hidden");
    localStorage.removeItem(TOKEN_KEY);
    refreshAuthState();
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
};

// Logout Handler (Returns to Guest Mode)
window.handleLogout = function() {
  if (confirm("Exit Administrator mode and return to Guest view?")) {
    localStorage.removeItem(TOKEN_KEY);
    refreshAuthState();
    fetchProjects();
    fetchPosts();
  }
};

// Typewriter Engine
function initContinuousTypewriter(elementId, textArray, typingSpeed, deletingSpeed, pauseDuration) {
  const el = document.getElementById(elementId);
  if (!el) return;

  let arrayIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentString = textArray[arrayIndex];

    if (isDeleting) {
      el.textContent = currentString.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentString.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentString.length) {
      delay = pauseDuration;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      arrayIndex = (arrayIndex + 1) % textArray.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  type();
}

// Project Form Submission
window.handleProjectSubmit = async function(event) {
  event.preventDefault();
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    alert("Unauthorized. Please log in as Administrator.");
    return;
  }

  const payload = {
    title: document.getElementById("proj-title").value,
    description: document.getElementById("proj-desc").value,
    tech_stack: document.getElementById("proj-stack").value,
    github_url: document.getElementById("proj-github").value,
    live_demo_url: document.getElementById("proj-demo").value || null,
  };

  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      document.getElementById("add-project-form").reset();
      closeModal("project-modal");
      fetchProjects();
    } else {
      alert("Unauthorized session. Please log in again.");
      handleLogout();
    }
  } catch {
    alert("Network error connecting to backend.");
  }
};

// Post Form Submission
window.handlePostSubmit = async function(event) {
  event.preventDefault();
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    alert("Unauthorized. Please log in as Administrator.");
    return;
  }

  const payload = {
    title: document.getElementById("post-title").value,
    slug: document.getElementById("post-slug").value,
    tags: document.getElementById("post-tags").value,
    content: document.getElementById("post-content").value,
  };

  try {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      document.getElementById("add-post-form").reset();
      closeModal("post-modal");
      fetchPosts();
    } else {
      alert("Unauthorized or slug already exists.");
    }
  } catch {
    alert("Network error connecting to backend.");
  }
};

// Toggle View More / Show Less
window.toggleExpand = function(id) {
  const shortEl = document.getElementById(`short-${id}`);
  const fullEl = document.getElementById(`full-${id}`);
  const btn = document.getElementById(`btn-${id}`);

  if (fullEl.classList.contains("hidden")) {
    fullEl.classList.remove("hidden");
    shortEl.classList.add("hidden");
    btn.innerHTML = "Show Less &uarr;";
  } else {
    fullEl.classList.add("hidden");
    shortEl.classList.remove("hidden");
    btn.innerHTML = "View More &rarr;";
  }
};

// Fetch Projects
async function fetchProjects() {
  const container = document.getElementById("projects-grid");
  const isAdminActive = !!localStorage.getItem(TOKEN_KEY);

  try {
    const res = await fetch("/api/projects");
    const projects = await res.json();

    if (projects.length === 0) {
      container.innerHTML = `<div class="empty-state">No technical implementations published yet.</div>`;
      return;
    }

    container.innerHTML = projects.map(proj => {
      const tags = proj.tech_stack.split(",").map(t => `<span class="tech-tag">${escapeHTML(t.trim())}</span>`).join("");
      let links = "";
      if (proj.github_url) links += `<a href="${proj.github_url}" target="_blank" rel="noopener noreferrer">Source Code &rarr;</a>`;
      if (proj.live_demo_url) links += `<a href="${proj.live_demo_url}" target="_blank" rel="noopener noreferrer">Live Demo &rarr;</a>`;

      const isLong = proj.description.length > 150;
      const snippet = isLong ? proj.description.substring(0, 150) + "..." : proj.description;

      const descriptionHTML = isLong ? `
        <p class="card-desc" id="short-proj-${proj.id}">${escapeHTML(snippet)}</p>
        <div class="card-desc full-content-box hidden" id="full-proj-${proj.id}">${escapeHTML(proj.description)}</div>
        <button class="expand-toggle-btn" id="btn-proj-${proj.id}" onclick="toggleExpand('proj-${proj.id}')">View More &rarr;</button>
      ` : `<p class="card-desc">${escapeHTML(proj.description)}</p>`;

      const deleteBtn = isAdminActive ? `
        <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); text-align: right;">
          <button style="background: none; border: none; color: #f43f5e; cursor: pointer; font-size: 0.8rem;" onclick="deleteProject(${proj.id})">Delete Project</button>
        </div>
      ` : "";

      return `
        <article class="card">
          <div>
            <h3 class="card-title">${escapeHTML(proj.title)}</h3>
            ${descriptionHTML}
            <div class="tech-tags" style="margin-top: 1rem;">${tags}</div>
          </div>
          <div class="card-links">${links}</div>
          ${deleteBtn}
        </article>
      `;
    }).join("");
  } catch {
    container.innerHTML = `<div class="loading-state">Failed to load projects.</div>`;
  }
}

// Fetch Publications
async function fetchPosts() {
  const container = document.getElementById("posts-container");
  const isAdminActive = !!localStorage.getItem(TOKEN_KEY);

  try {
    const res = await fetch("/api/posts");
    const posts = await res.json();

    if (posts.length === 0) {
      container.innerHTML = `<div class="empty-state">No engineering publications posted yet.</div>`;
      return;
    }

    container.innerHTML = posts.map(post => {
      const date = new Date(post.created_at).toLocaleDateString("en-US", {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      const isLong = post.content.length > 180;
      const snippet = isLong ? post.content.substring(0, 180) + "..." : post.content;

      const contentHTML = isLong ? `
        <p class="post-excerpt" id="short-post-${post.id}">${escapeHTML(snippet)}</p>
        <div class="post-excerpt full-content-box hidden" id="full-post-${post.id}">${escapeHTML(post.content)}</div>
        <button class="expand-toggle-btn" id="btn-post-${post.id}" onclick="toggleExpand('post-${post.id}')">View More &rarr;</button>
      ` : `<p class="post-excerpt">${escapeHTML(post.content)}</p>`;

      const deleteBtn = isAdminActive ? `
        <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color); text-align: right;">
          <button style="background: none; border: none; color: #f43f5e; cursor: pointer; font-size: 0.8rem;" onclick="deletePost(${post.id})">Delete Publication</button>
        </div>
      ` : "";

      return `
        <article class="post-item">
          <div class="post-meta">${date} &bull; ${escapeHTML(post.tags || "Engineering")}</div>
          <h3 class="post-title">${escapeHTML(post.title)}</h3>
          ${contentHTML}
          ${deleteBtn}
        </article>
      `;
    }).join("");
  } catch {
    container.innerHTML = `<div class="loading-state">Failed to load publications.</div>`;
  }
}

window.deleteProject = async function(id) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  if (!confirm("Are you sure you want to delete this project?")) return;

  await fetch(`/api/projects/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  fetchProjects();
};

window.deletePost = async function(id) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  if (!confirm("Are you sure you want to delete this publication?")) return;

  await fetch(`/api/posts/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  fetchPosts();
};

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}