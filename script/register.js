
$("#registerForm").submit(function (e) {
    e.preventDefault();

    let email = $("#registerEmail").val().trim();
    let phone = $("#phone").val().trim();
    let password = $("#registerPassword").val();
    let confirmPassword = $("#confirmPassword").val();

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phoneRegex = /^[0-9]\d{9}$/;
    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
        alert("Enter a valid email address");
        return;
    }

    if (!phoneRegex.test(phone)) {
        alert("Enter a valid 10-digit phone number");
        return;
    }

    if (!passwordRegex.test(password)) {
        alert(
            "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
        );
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }
    alert("registered successfully");
    window.location.href = "dashboard.html";
});
