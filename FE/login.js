
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
    const githubButtons = document.querySelectorAll('.github-btn');
    
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
    
    // Login functionality
    loginBtn.addEventListener('click', () => {
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      
      // Simple validation
      if (!username || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
      }
      
      // Simulate login process
      loginError.textContent = '';
      loginError.style.color = '#4BB543';
      loginError.textContent = 'Logging in...';
      
      setTimeout(() => {
        loginError.textContent = 'Login successful! Redirecting...';
        setTimeout(() => {
          // Redirect to dashboard in a real app
          alert('Login successful! You would be redirected to the dashboard.');
        }, 1000);
      }, 1500);
    });
    
    // Registration functionality
    registerBtn.addEventListener('click', () => {
      const username = document.getElementById('reg-username').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm').value;
      
      // Simple validation
      if (!username || !email || !password || !confirmPassword) {
        registerError.textContent = 'Please fill in all fields';
        return;
      }
      
      if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match';
        return;
      }
      
      // Simulate registration process
      registerError.textContent = '';
      registerError.style.color = '#4BB543';
      registerError.textContent = 'Creating account...';
      
      setTimeout(() => {
        registerError.textContent = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          registerForm.style.display = 'none';
          loginForm.style.display = 'block';
          registerError.textContent = '';
        }, 1500);
      }, 1500);
    });
    
    // Social login functionality
    googleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        alert('Google authentication selected. In a real application, this would redirect to Google OAuth.');
      });
    });
    
    githubButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        alert('GitHub authentication selected. In a real application, this would redirect to GitHub OAuth.');
      });
    });
    
    // Forgot password functionality
    document.getElementById('forgot-password').addEventListener('click', () => {
      const email = prompt('Please enter your email to reset your password:');
      if (email) {
        alert(`Password reset instructions have been sent to ${email}. Check your inbox.`);
      }
    });
