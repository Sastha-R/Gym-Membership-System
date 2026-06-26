$(function () {
  $("#loginForm").on("submit", async function (event) {
    event.preventDefault();

    const email = $("#loginEmail").val().trim().toLowerCase();
    const password = $("#loginPassword").val().trim();
    let isValid = true;

    $(".is-invalid", this).removeClass("is-invalid");

    if (!email) {
      $("#loginEmail").addClass("is-invalid").siblings(".invalid-feedback").text("Email is required");
      isValid = false;
    }

    if (!password) {
      $("#loginPassword").addClass("is-invalid").siblings(".invalid-feedback").text("Password is required");
      isValid = false;
    }

    if (!isValid) return;

    try {
      const users = await api.get(`users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      const user = users[0];
      if (!user) {
        await Swal.fire("Invalid credentials", "Please check your email and password.", "error");
        return;
      }

      localStorage.setItem("loggedInUser", JSON.stringify(user));
      await Swal.fire("Login successful", `Welcome ${user.name}.`, "success");
      window.location.href = user.role === "owner" ? "owner-dashboard.html" : "customer-dashboard.html";
    } catch (error) {
      Swal.fire("Login failed", error.message, "error");
    }
  });
});
