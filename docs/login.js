// DOM elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');

// Social login buttons
const googleButtons = document.querySelectorAll('.google-btn');
// Removed githubButtons

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Password visibility toggle
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('login-password');
  const toggleBtn = document.querySelector('.password-toggle');
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleBtn.textContent = '🙈';
  } else {
    passwordInput.type = 'password';
    toggleBtn.textContent = '👁️';
  }
}

// Switch to registration form
showRegister.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
});

// Switch to login form
showLogin.addEventListener('click', () => {
  registerForm.style.display = 'none';
  loginForm.style.display = 'block';
});

// Login functionality - FIXED VERSION
loginBtn.addEventListener('click', async () => {
  const loginInput = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  // Simple validation
  if (!loginInput || !password) {
    loginError.textContent = 'Please fill in all fields';
    loginError.style.color = '#e74c3c';
    return;
  }
  
  // Clear previous errors
  loginError.textContent = '';
  loginError.style.color = '#4BB543';
  loginError.textContent = 'Logging in...';
  
  try {
    // Improved email detection - check for @ and at least one dot after @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(loginInput);
    
    // Always send both fields, let the backend decide which to use
    const loginData = {
      username: !isEmail ? loginInput : undefined,
      email: isEmail ? loginInput : undefined,
      password: password
    };

    // Remove undefined fields to clean up the request
    Object.keys(loginData).forEach(key => 
      loginData[key] === undefined && delete loginData[key]
    );

    console.log('Login attempt:', { 
      isEmail, 
      loginInput, 
      loginData,
      hasPassword: !!password
    }); // Debug log

    // Determine if admin login (username/email matches admin)
    const isAdminLogin = (loginInput.toLowerCase() === 'admin' || loginInput.toLowerCase() === 'admin@gmail.com');
    const loginEndpoint = isAdminLogin ? '/admin/login' : '/auth/login';

    const response = await fetch(`${API_BASE_URL}${loginEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    console.log('Login response:', { 
      status: response.status, 
      statusText: response.statusText,
      data 
    }); // Debug log

    if (response.ok) {
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      loginError.textContent = 'Login successful! Redirecting...';
      // Redirect admin to adminPanel.html, others to index.html
      if (data.role === 'admin' || data.role === 'superadmin') {
        setTimeout(() => {
          window.location.href = 'adminPanel.html';
        }, 1000);
      } else {
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    } else {
      loginError.style.color = '#e74c3c';
      loginError.textContent = data.message || 'Login failed';
      console.error('Login failed:', data); // Debug log
    }
  } catch (error) {
    console.error('Login error:', error);
    loginError.style.color = '#e74c3c';
    loginError.textContent = 'Network error. Please try again.';
  }
});

// Real-time email validation
document.getElementById('reg-email').addEventListener('input', function() {
  const email = this.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const registerError = document.getElementById('register-error');
  
  if (email && !emailRegex.test(email)) {
    registerError.textContent = 'Please enter a valid email address (e.g., user@gmail.com)';
    registerError.style.color = '#e74c3c';
  } else if (email && emailRegex.test(email)) {
    registerError.textContent = '';
  }
});

// Registration functionality
registerBtn.addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm').value;
  
  // Simple validation
  if (!username || !email || !password || !confirmPassword) {
    registerError.textContent = 'Please fill in all fields';
    registerError.style.color = '#e74c3c';
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    registerError.textContent = 'Please enter a valid email address (e.g., user@gmail.com)';
    registerError.style.color = '#e74c3c';
    return;
  }
  
  // Username validation
  if (username.length < 3) {
    registerError.textContent = 'Username must be at least 3 characters long';
    registerError.style.color = '#e74c3c';
    return;
  }
  
  // Password validation
  if (password.length < 6) {
    registerError.textContent = 'Password must be at least 6 characters long';
    registerError.style.color = '#e74c3c';
    return;
  }
  
  if (password !== confirmPassword) {
    registerError.textContent = 'Passwords do not match';
    registerError.style.color = '#e74c3c';
    return;
  }
  
  // Clear previous errors
  registerError.textContent = '';
  registerError.style.color = '#4BB543';
  registerError.textContent = 'Creating account...';
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      
      registerError.textContent = 'Registration successful! Redirecting...';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      registerError.style.color = '#e74c3c';
      registerError.textContent = data.message || 'Registration failed';
    }
  } catch (error) {
    console.error('Registration error:', error);
    registerError.style.color = '#e74c3c';
    registerError.textContent = 'Network error. Please try again.';
  }
});

// Social login functionality
googleButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  });
});



// Forgot password functionality
document.getElementById('forgot-password').addEventListener('click', () => {
  const email = prompt('Please enter your email to reset your password:');
  if (email) {
    alert(`Password reset instructions have been sent to ${email}. Check your inbox.`);
  }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    // User is already logged in, redirect to dashboard
    window.location.href = 'userdashboard.html';
  }
});