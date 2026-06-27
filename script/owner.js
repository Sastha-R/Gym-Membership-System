let plans = [];
let users = [];
let memberships = [];
let planFilter = "All";
let memberFilter = "All";
let memberPage = 1;
const membersPerPage = 5;
let ownername;

document.addEventListener("DOMContentLoaded", async () => {
  ownername = requireRole("owner");
  document.getElementById("Welcome_owner").textContent = `Welcome ${ownername.name.toUpperCase()}`; 
  bindOwnerEvents();
  await loadOwnerData();
});

function bindOwnerEvents() {
  document.getElementById("openPlanModal").addEventListener("click", openAddPlanModal);
  document.getElementById("planForm").addEventListener("submit", savePlan);
  document.getElementById("planSearch").addEventListener("input", renderPlans);
  document.getElementById("memberSearch").addEventListener("input", () => {
    memberPage = 1;
    renderMembers();
  });

  document.getElementById("planFilters").addEventListener("click", (event) => {
    if (!event.target.dataset.filter) return;
    planFilter = event.target.dataset.filter;
    setActiveFilter(event.currentTarget, event.target);
    renderPlans();
  });

  document.getElementById("memberFilters").addEventListener("click", (event) => {
    if (!event.target.dataset.filter) return;
    memberFilter = event.target.dataset.filter;
    memberPage = 1;
    setActiveFilter(event.currentTarget, event.target);
    renderMembers();
  });
}

async function loadOwnerData() {
    plans = await api.get("plans");
    users = await api.get("users");
    memberships = await api.get("memberships");

    renderDashboardCards();
    renderPlans();
    renderMembers();
}

function setActiveFilter(group, activeButton) {
  group.querySelectorAll("button").forEach((button) => {
    button.classList.remove("btn-primary", "btn-outline-primary", "btn-outline-secondary");
    if (button === activeButton) {
      button.classList.add("btn-primary");
    } else if (button.dataset.filter === "Deleted") {
      button.classList.add("btn-outline-secondary");
    } else {
      button.classList.add("btn-outline-primary");
    }
  });
}

function renderDashboardCards() {
  const customers = users.filter((user) => user.role === "customer");
  const activeCustomers = customers.filter((customer) => {
    const membership = getLatestMembership(customer.id);
    return membership && getMembershipStatus(membership) === "Active";
  });

  document.getElementById("totalMembers").textContent = customers.length;
  document.getElementById("totalPlans").textContent = plans.filter((plan) => !plan.isDeleted).length;
  document.getElementById("activeMembers").textContent = activeCustomers.length;
  document.getElementById("expiredMembers").textContent = customers.length - activeCustomers.length;
}

function renderPlans() {
  const search = document.getElementById("planSearch").value.toLowerCase();
  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = plan.planName.toLowerCase().includes(search);
    if (!matchesSearch) return false;
    if (planFilter === "Deleted") return plan.isDeleted;
    if (plan.isDeleted) return false;
    if (planFilter === "All") return true;
    if (planFilter === "Active" || planFilter === "Inactive") return plan.status === planFilter;
    return getDurationType(plan.duration) === planFilter;
  });

  document.getElementById("plansTableBody").innerHTML = filteredPlans.map((plan) => {
    const statusClass = plan.status === "Active" ? "badge-active" : "badge-inactive";
    const actionButtons = plan.isDeleted
      ? `<button class="btn btn-sm btn-outline-success" onclick="restorePlan('${plan.id}')"><i class="bi bi-arrow-counterclockwise"></i> Restore</button>`
      : `<button class="btn btn-sm btn-outline-primary" onclick="openEditPlanModal('${plan.id}')"><i class="bi bi-pencil"></i> Edit</button>
         <button class="btn btn-sm btn-outline-danger" onclick="softDeletePlan('${plan.id}')"><i class="bi bi-trash"></i> Delete</button>`;

    return `<tr>
      <td>${plan.planName}</td>
      <td>${plan.duration} days</td>
      <td>Rs. ${Number(plan.price).toLocaleString("en-IN")}</td>
      <td><span class="badge-soft ${statusClass}">${plan.isDeleted ? "Deleted" : plan.status}</span></td>
      <td class="text-end"><div class="d-inline-flex gap-2 flex-wrap justify-content-end">${actionButtons}</div></td>
    </tr>`;
  }).join("") || `<tr><td colspan="5" class="text-center text-muted py-4">No plans found</td></tr>`;
}

function openAddPlanModal() {
  document.getElementById("planModalTitle").textContent = "Add Plan";
  document.getElementById("planForm").reset();
  document.getElementById("planId").value = "";
  document.querySelectorAll("#planForm .is-invalid").forEach(clearInvalid);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("planModal")).show();
}

function openEditPlanModal(planId) {
  const plan = plans.find((item) => String(item.id) === String(planId));
  if (!plan) return;
  document.getElementById("planModalTitle").textContent = "Edit Plan";
  document.getElementById("planId").value = plan.id;
  document.getElementById("planName").value = plan.planName;
  document.getElementById("planDuration").value = plan.duration;
  document.getElementById("planPrice").value = plan.price;
  document.getElementById("planStatus").value = plan.status;
  document.querySelectorAll("#planForm .is-invalid").forEach(clearInvalid);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("planModal")).show();
}

async function savePlan(event) {
  event.preventDefault();
  const id = document.getElementById("planId").value;
  const planName = document.getElementById("planName");
  const duration = document.getElementById("planDuration");
  const price = document.getElementById("planPrice");
  const status = document.getElementById("planStatus").value;
  let isValid = true;

        clearInvalid(planName);
        clearInvalid(duration);
        clearInvalid(price);

  if (!planName.value.trim()) {
    setInvalid(planName, "Plan name is required");
    isValid = false;
  }
  if (Number(duration.value) <= 0) {
    setInvalid(duration, "Duration must be positive");
    isValid = false;
  }
  if (Number(price.value) <= 0) {
    setInvalid(price, "Price must be positive");
    isValid = false;
  }
  if (!isValid) return;

  const payload = {
    planName: planName.value.trim(),
    duration: Number(duration.value),
    price: Number(price.value),
    status
  };

  if (id) {
    await api.patch("plans", id, payload);
    await Swal.fire("Plan updated", "Plan details were saved.", "success");
  } else {
    await api.post("plans", { ...payload, isDeleted: false, createdAt: new Date().toISOString() });
    await Swal.fire("Plan added", "The new plan is ready.", "success");
  }

  bootstrap.Modal.getInstance(document.getElementById("planModal")).hide();
  await loadOwnerData();
}

async function softDeletePlan(planId) {
  const result = await Swal.fire({
    title: "Delete plan?",
    text: "This will move the plan to Deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete"
  });
  if (!result.isConfirmed) return;
  await api.patch("plans", planId, { isDeleted: true });
  await Swal.fire("Deleted", "Plan moved to Deleted.", "success");
  await loadOwnerData();
}

async function restorePlan(planId) {
  const result = await Swal.fire({
    title: "Restore plan?",
    text: "This plan will appear in normal lists again.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Restore"
  });
  if (!result.isConfirmed) return;
  await api.patch("plans", planId, { isDeleted: false });
  await Swal.fire("Restored", "Plan restored successfully.", "success");
  await loadOwnerData();
}

function getLatestMembership(userId) {
  return memberships
    .filter((membership) => String(membership.userId) === String(userId))
    .sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate))[0];
}

function renderMembers() {
  const search = document.getElementById("memberSearch").value.toLowerCase();
  const customers = users.filter((user) => user.role === "customer");
  const rows = customers.map((customer) => {
    const membership = getLatestMembership(customer.id);
    const plan = membership ? plans.find((item) => String(item.id) === String(membership.planId)) : null;
    const status = membership ? getMembershipStatus(membership) : "Expired";
    return { customer, membership, plan, status };
  }).filter((row) => {
    const text = `${row.customer.name} ${row.customer.email} ${row.customer.phone}`.toLowerCase();
    const matchesSearch = text.includes(search);
    const matchesFilter = memberFilter === "All" || row.status === memberFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / membersPerPage));
  if (memberPage > totalPages) memberPage = totalPages;
  const pageRows = rows.slice((memberPage - 1) * membersPerPage, memberPage * membersPerPage);

  document.getElementById("membersTableBody").innerHTML = pageRows.map((row) => {
    const badgeClass = row.status === "Active" ? "badge-active" : "badge-expired";
    return `<tr>
      <td>${row.customer.name}</td>
      <td>${row.customer.email}</td>
      <td>${row.customer.phone}</td>
      <td>${row.plan ? row.plan.planName : "No Plan"}</td>
      <td>${formatDate(row.membership?.expiryDate)}</td>
      <td><span class="badge-soft ${badgeClass}">${row.status}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="6" class="text-center text-muted py-4">No members found</td></tr>`;

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pagination = document.getElementById("membersPagination");
  let markup = `<li class="page-item ${memberPage === 1 ? "disabled" : ""}">
    <button class="page-link" onclick="changeMemberPage(${memberPage - 1})">Previous</button>
  </li>`;

  for (let index = 1; index <= totalPages; index += 1) {
    markup += `<li class="page-item ${index === memberPage ? "active" : ""}">
      <button class="page-link" onclick="changeMemberPage(${index})">${index}</button>
    </li>`;
  }

  markup += `<li class="page-item ${memberPage === totalPages ? "disabled" : ""}">
    <button class="page-link" onclick="changeMemberPage(${memberPage + 1})">Next</button>.
  </li>`;

  pagination.innerHTML = markup;
}

function changeMemberPage(page) {
  if (page < 1) return;
  memberPage = page;
  renderMembers();
}
