// login.js
import { Auth } from './modules/auth.js';

// Mobile debugging
console.log('=== LOGIN PAGE LOADED ===');
console.log('Current URL:', window.location.href);
console.log('User agent:', navigator.userAgent);
console.log('Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));



// Prevent form submission and use our custom handlers
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
});

// Function to set loading state
function setLoading(isLoading) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    loginBtn.disabled = isLoading;
    registerBtn.disabled = isLoading;
    
    loginBtn.textContent = isLoading ? 'Loading...' : 'Login';
    registerBtn.textContent = isLoading ? 'Loading...' : 'Register';
}

// Function to show message with optional styling
function showMessage(message, isError = false) {
    const msg = document.getElementById('message');
    msg.textContent = message;
    msg.style.color = isError ? '#dc3545' : '#28a745';
}

// Mobile-friendly event handling
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Add both click and touchstart events for mobile compatibility
['click', 'touchstart'].forEach(eventType => {
    loginBtn.addEventListener(eventType, async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent double execution
        if (loginBtn.disabled) return;
        
    console.log('=== LOGIN ATTEMPT START ===');
        console.log('Event type:', eventType);
        console.log('Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    console.log('Login attempt for email:', email);
    
    if (!email || !password) {
        showMessage('Please fill in all fields', true);
        return;
    }
    
    try {
        setLoading(true);
        console.log('Calling Auth.login...');
        const result = await Auth.login(email, password);
        console.log('Auth.login result:', result);
        
        if (result.success) {
            showMessage('✅ Logged in!');
            console.log('Login successful!');
            
            // Store stats from login response (this is the key fix!)
            if (result.stats) {
                localStorage.setItem('initialStats', JSON.stringify(result.stats));
                console.log('Stored initial stats from login response:', result.stats);
            }
            
            // Also pre-fetch fresh stats as backup
            try {
                console.log('Pre-fetching fresh stats...');
                const statsRes = await fetch('/api/users/stats', {
                    headers: { 'Authorization': `Bearer ${result.token}` }
                });
                console.log('Stats response status:', statsRes.status);
                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    // Store fresh stats in localStorage for immediate display
                    localStorage.setItem('userStats', JSON.stringify(stats));
                    console.log('Pre-fetched fresh stats:', stats);
                } else {
                    console.error('Failed to pre-fetch stats:', statsRes.status);
                }
            } catch (error) {
                console.error('Error pre-fetching stats:', error);
            }
            
            console.log('Login successful, redirecting to index.html...');
            console.log('=== LOGIN ATTEMPT END ===');
            window.location.href = 'index.html';
        } else {
            console.log('Login failed:', result.message);
            showMessage(result.message || 'Login failed', true);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(error.message || 'Login failed', true);
    } finally {
        setLoading(false);
    }
});

    registerBtn.addEventListener(eventType, async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent double execution
        if (registerBtn.disabled) return;
        
        console.log('=== REGISTER ATTEMPT START ===');
        console.log('Event type:', eventType);
        
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', true);
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', true);
        return;
    }
    
    try {
        setLoading(true);
        showMessage('Registering...');
        
        console.log('Attempting to register with:', { email, passwordLength: password.length }); // Safe debug log
        
        const result = await Auth.register(email, password);
        console.log('Registration result:', result);
        
        if (result.success) {
            showMessage('✅ Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(result.message || 'Registration failed', true);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(error.message || 'Registration failed', true);
    } finally {
        setLoading(false);
    }
});
});