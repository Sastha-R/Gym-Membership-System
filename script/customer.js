let customerUser = null;
let customerPlans = [];
let customerMemberships = [];
let availableFilter = "All";

document.addEventListener("DOMContentLoaded", async () => {
  customerUser = requireRole("customer");
  if (!customerUser) return;
  document.getElementById("customerWelcome").textContent = `Welcome ${customerUser.name}`;
  bindCustomerEvents();
  await loadCustomerData();
});

function bindCustomerEvents() {
  document.getElementById("availablePlanSearch").addEventListener("input", renderAvailablePlans);
  document.getElementById("availablePlanFilters").addEventListener("click", (event) => {
    if (!event.target.dataset.filter) return;
    availableFilter = event.target.dataset.filter;
    event.currentTarget.querySelectorAll("button").forEach((button) => {
      button.classList.toggle("btn-primary", button === event.target);
      button.classList.toggle("btn-outline-primary", button !== event.target);
    });
    renderAvailablePlans();
  });
}

async function loadCustomerData() {
  [customerPlans, customerMemberships] = await Promise.all([
    api.get("plans"),
    api.get(`memberships?userId=${customerUser.id}`)
  ]);
  renderCustomerCards();
  renderAvailablePlans();
}

function getCustomerMembership() {
  return customerMemberships
    .sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate))[0];
}

function renderCustomerCards() {
  const membership = getCustomerMembership();
  const plan = membership ? customerPlans.find((item) => String(item.id) === String(membership.planId)) : null;
  const status = membership ? getMembershipStatus(membership) : "Expired";
  const diff = membership ? Math.ceil((new Date(membership.expiryDate) - todayAtMidnight()) / 86400000) : 0;

  document.getElementById("currentPlan").textContent = plan && status === "Active" ? plan.planName : "None";
  document.getElementById("expiryDate").textContent = membership ? formatDate(membership.expiryDate) : "-";
  document.getElementById("daysRemaining").textContent = Math.max(0, diff);
}

function renderAvailablePlans() {
  const membership = getCustomerMembership();
  const membershipStatus = membership ? getMembershipStatus(membership) : "Expired";
  const search = document.getElementById("availablePlanSearch").value.toLowerCase();
  const filteredPlans = customerPlans.filter((plan) => {
    const isAvailable = plan.status === "Active" && plan.isDeleted === false;
    const matchesSearch = plan.planName.toLowerCase().includes(search);
    const matchesFilter = availableFilter === "All" || getDurationType(plan.duration) === availableFilter;
    return isAvailable && matchesSearch && matchesFilter;
  });

  document.getElementById("availablePlansBody").innerHTML = filteredPlans.map((plan) => {
    const hasActiveMembership = membership && membershipStatus === "Active";
    const hasExpired = !membership || membershipStatus === "Expired";
    const label = hasActiveMembership ? "Already Has a Plan" : hasExpired ? (membership ? "Renew" : "Buy") : "Buy";
    const disabled = hasActiveMembership ? "disabled" : "";
    const action = label === "Buy" ? "buyPlan" : "renewPlan";

    return `<tr>
      <td>${plan.planName}</td>
      <td>${plan.duration} days</td>
      <td>Rs. ${Number(plan.price).toLocaleString("en-IN")}</td>
      <td class="text-end">
        <button class="btn btn-sm ${disabled ? "btn-secondary" : "btn-primary"}" ${disabled} onclick="${action}('${plan.id}')">
          <i class="bi ${label === "Already Has a Plan" ? "bi-check2-circle" : "bi-bag-check"}"></i> ${label}
        </button>
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="4" class="text-center text-muted py-4">No plans found</td></tr>`;
}

async function buyPlan(planId) {
  const plan = customerPlans.find((item) => String(item.id) === String(planId));
  if (!plan) return;
  await api.post("memberships", {
    userId: customerUser.id,
    planId: plan.id,
    purchaseDate: todayAtMidnight().toISOString().slice(0, 10),
    expiryDate: addDays(plan.duration)
  });
  await Swal.fire("Plan purchased", "Your membership is active.", "success");
  await loadCustomerData();
}

async function renewPlan(planId) {
  const plan = customerPlans.find((item) => String(item.id) === String(planId));
  const membership = getCustomerMembership();
  if (!plan || !membership) return;
  await api.patch("memberships", membership.id, {
    planId: plan.id,
    purchaseDate: todayAtMidnight().toISOString().slice(0, 10),
    expiryDate: addDays(plan.duration)
  });
  await Swal.fire("Plan renewed", "Your membership has been updated.", "success");
  await loadCustomerData();
}
