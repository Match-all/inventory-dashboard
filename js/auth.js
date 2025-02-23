const API_URL = 'http://localhost:3000/api';

async function handleRegister(event) {
    event.preventDefault();
    console.log('Registration started...');

    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        const formData = new FormData(event.target);
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();
        console.log('Registration response:', data);

        if (data.success) {
            showToast('Registration successful! Redirecting to home page...', 'success');
            event.target.reset();
            setTimeout(() => {
                window.location.href = '/index.html'; // Redirect to home page
            }, 1000);
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed. Please try again.', 'error');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Login successful! Redirecting to home page...', 'success');
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => {
                window.location.href = '/index.html'; // Redirect to home page
            }, 1000);
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    }
}

function updateAuthUI(user) {
    const loggedOutLinks = document.querySelector('.logged-out-links');
    const loggedInLinks = document.querySelector('.logged-in-links');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (user) {
        loggedOutLinks.classList.add('d-none');
        loggedInLinks.classList.remove('d-none');
        userNameDisplay.textContent = user.name;
    } else {
        loggedOutLinks.classList.remove('d-none');
        loggedInLinks.classList.add('d-none');
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    
    const icon = input.parentElement.querySelector('.bi');
    if (icon) {
        icon.classList.toggle('bi-eye');
        icon.classList.toggle('bi-eye-slash');
    }
}

async function handleLogout() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();
        
        if (data.success) {
            localStorage.removeItem('user');
            showToast('Logged out successfully', 'success');
            
            // Update UI
            const loggedOutLinks = document.querySelector('.logged-out-links');
            const loggedInLinks = document.querySelector('.logged-in-links');
            
            if (loggedOutLinks && loggedInLinks) {
                loggedOutLinks.classList.remove('d-none');
                loggedInLinks.classList.add('d-none');
            }
        } else {
            showToast('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    }
}

async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_URL}/check-auth`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            const loggedOutLinks = document.querySelector('.logged-out-links');
            const loggedInLinks = document.querySelector('.logged-in-links');
            const userNameDisplay = document.getElementById('userNameDisplay');

            if (loggedOutLinks && loggedInLinks && userNameDisplay) {
                loggedOutLinks.classList.add('d-none');
                loggedInLinks.classList.remove('d-none');
                userNameDisplay.textContent = data.user.name;
            }
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Add toast container if it doesn't exist
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    checkAuthStatus();
}); 