$(function () {
    //  LOGIN FORM SUBMISSION

  $("#loginForm").on("submit", async function (event) {
    event.preventDefault();

    const email = $("#loginEmail").val().trim().toLowerCase();
    const password = $("#loginPassword").val().trim();
    let isValid = true;

    $(".is-invalid", this).removeClass("is-invalid");
    // Validate email
    if (!email) {
      $("#loginEmail").addClass("is-invalid").siblings(".invalid-feedback").text("Email is required");
      isValid = false;
    }
    // Validate password
    if (!password) {
      $("#loginPassword").addClass("is-invalid").siblings(".invalid-feedback").text("Password is required");
      isValid = false;
    }

    if (!isValid) return;
  //  USER AUTHENTICATION
    try {
      const users = await api.get(`users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      const user = users[0];
      if (!user) {
        await Swal.fire("Invalid credentials", "Please check your email and password.", "error");
        return;
      }
      // Store logged-in user
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      await Swal.fire("Login successful", `Welcome ${user.name}.`, "success");
      // Redirect based on user role
      window.location.href = user.role === "owner" ? "owner-dashboard.html" : "customer-dashboard.html";
    } catch (error) {
      Swal.fire("Login failed", error.message, "error");
    }
  });
});
