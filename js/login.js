document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // اطلاعات ورود ثابت (میتوانی بعدها وصل کنی به دیتابیس)
    if (username === 'admin' && password === '1234') {
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'index.html';
    } else {
        document.getElementById('login-error').textContent = 'نام کاربری یا رمز عبور اشتباه است';
    }
});