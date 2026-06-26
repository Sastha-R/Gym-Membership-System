$(function () {
  $("#registerForm").on("submit", async function (event) {
    event.preventDefault();

    const form = this;
    const name = $("#registerName").val().trim();
    const email = $("#registerEmail").val().trim().toLowerCase();
    const phone = $("#registerPhone").val().trim();
    const password = $("#registerPassword").val().trim();
    const confirmPassword = $("#confirmPassword").val().trim();
    let isValid = true;

    $(".is-invalid", form).removeClass("is-invalid");

    function mark(selector, message) {
      $(selector).addClass("is-invalid").siblings(".invalid-feedback").text(message);
      isValid = false;
    }

    if (!name)
       mark("#registerName", "Name is required");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) 
      mark("#registerEmail", "Enter a valid email");

    if (!/^\d{10}$/.test(phone))
       mark("#registerPhone", "Phone must contain exactly 10 digits");

    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password))
    mark("#registerPassword", "Password must be at least 6 characters");

    if (confirmPassword !== password)
      mark("#registerPassword", "Password must be at least 6 characters with 1 uppercase letter and 1 number");

    if (!isValid)
       return;

    try {
      const existingUsers = await api.get(`users?email=${encodeURIComponent(email)}`);
      if (existingUsers.length) {
        mark("#registerEmail", "Email already exists");
        return;
      }

      await api.post("users", {
        name,
        email,
        phone,
        password,
        role: "customer",
        createdAt: new Date().toISOString()
      });

      await Swal.fire("Registration successful", "You can now login as a customer.", "success");
      bootstrap.Modal.getInstance(document.getElementById("registerModal")).hide();
      form.reset();
    } catch (error) {
      Swal.fire("Registration failed", error.message, "error");
    }
  });
});
