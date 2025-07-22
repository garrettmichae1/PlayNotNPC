// landing.js - Modular JS for PlayNotNPC landing page
// Purpose: Handles tabbed login/register, validation, and donation popup

import { Auth } from './modules/auth.js';

// Tab Switching Logic
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function switchTab(tab) {
  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
  } else {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
  }
}

loginTab.addEventListener('click', () => switchTab('login'));
registerTab.addEventListener('click', () => switchTab('register'));

// Login Logic
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('login-message');
  message.textContent = '';

  if (!email || !password) {
    message.textContent = 'Please fill in all fields.';
    message.className = 'auth-message';
    return;
  }
  try {
    message.textContent = 'Logging in...';
    const result = await Auth.login(email, password);
    if (result.success) {
      message.textContent = 'Logged in! Redirecting...';
      message.className = 'auth-message success';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } else {
      message.textContent = result.message || 'Login failed.';
      message.className = 'auth-message';
    }
  } catch (err) {
    message.textContent = err.message || 'Login failed.';
    message.className = 'auth-message';
  }
});

// Registration Logic
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const message = document.getElementById('register-message');
  const hint = document.getElementById('register-hint');
  message.textContent = '';
  hint.classList.remove('active');

  if (!email || !password) {
    message.textContent = 'Please fill in all fields.';
    message.className = 'auth-message';
    return;
  }
  if (password.length < 6) {
    hint.textContent = 'Password must be at least 6 characters.';
    hint.classList.add('active');
    return;
  }
  try {
    message.textContent = 'Registering...';
    const result = await Auth.register(email, password);
    if (result.success) {
      message.textContent = 'Registration successful! Redirecting...';
      message.className = 'auth-message success';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } else {
      message.textContent = result.message || 'Registration failed.';
      message.className = 'auth-message';
    }
  } catch (err) {
    message.textContent = err.message || 'Registration failed.';
    message.className = 'auth-message';
  }
}); 