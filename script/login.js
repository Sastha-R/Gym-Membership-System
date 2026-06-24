$("#loginForm").submit(function (e) {
    e.preventDefault();

    let email = $("#email").val().trim();
    let password = $("#password").val();

    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!emailRegex.test(email)) {
        alert("Enter a valid email address");
        return;
    }

    if (!passwordRegex.test(password)) {
        alert("Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character");
        return;
    }

    alert("login successfull");
    window.location.href = "dashboard.html";
});
