const API_URL = "http://localhost:3000";

const api = {
   // Retrieve data
  async get(resource) {
    const response = await fetch(`${API_URL}/${resource}`);
    if (!response.ok) throw new Error("Unable to load data");
    return response.json();
  },
   // Create data
  async post(resource, payload) {
    const response = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Unable to save data");
    return response.json();
  },
    // Update
  async patch(resource, id, payload) {
    const response = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Unable to update data");
    return response.json();
  }
};

function getLoggedInUser() {
  const user = localStorage.getItem("loggedInUser");
  return user ? JSON.parse(user) : null;
}
// page access based on user role

function requireRole(role) {
  const user = getLoggedInUser();
  if (!user || user.role !== role) {
    window.location.href = "index.html";
    return null;
  }
  return user;
}
// DD/MM/YYYY format
function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function todayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(days) {
  const date = todayAtMidnight();
  date.setDate(date.getDate() + Number(days));
  return date.toISOString().slice(0, 10);
}
// membership is Active or Expired
function getMembershipStatus(membership) {
  if (!membership) return "Expired";
  return new Date(membership.expiryDate) >= todayAtMidnight() ? "Active" : "Expired";
}

function getDurationType(days) {
  const duration = Number(days);
  if (duration <= 31) return "Monthly";
  if (duration <= 100) return "Quarterly";
  if (duration <= 190) return "Half-Yearly";
  return "Yearly";
}

function setInvalid(input, message) {
  input.classList.add("is-invalid");
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback) feedback.textContent = message;
}

function clearInvalid(input) {
  input.classList.remove("is-invalid");
  const feedback = input.parentElement.querySelector(".invalid-feedback");
  if (feedback)
     feedback.textContent = "";
}
// dialog before logging out
async function confirmLogout() {
  const result = await Swal.fire({
    title: "Logout?",
    text: "Are you sure want to logout?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Logout"
  });
  if (result.isConfirmed) {
    localStorage.removeItem("loggedInUser");
    await Swal.fire("Logged out", "See you next time.", "success");
    window.location.href = "index.html";
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", confirmLogout);
}
// theme
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  const icon = document.querySelector("#themeToggle i");
  if (icon) icon.className = theme === "dark" ? "bi bi-sun" : "bi bi-moon-stars";
}

function setupThemeToggle() {
  applyTheme(localStorage.getItem("theme") || "light");
  const button = document.getElementById("themeToggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupLogout();
});
