// Authentication module for handling user registration, login, and session management
export const Auth = {
    /**
     * Register a new user with email and password.
     * Sends a POST request to the backend and stores the token and username on success.
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<Object>} Result object with success status and username or error message
     */
    async register(email, password) {
        try {
            // Use AbortController to set a timeout for the request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            // Store both token and username in localStorage
            localStorage.setItem('token', data.token);
            if (data.username) {
                localStorage.setItem('username', data.username);
            }
            
            return { success: true, username: data.username };
        } catch (error) {
            if (error.name === 'AbortError') {
                return { success: false, message: 'Request timed out. Please try again.' };
            }
            return { success: false, message: error.message };
        }
    },

    /**
     * Log in a user with email and password.
     * Stores token, username, and initial stats on success.
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<Object>} Result object with success status, stats, and username or error message
     */
    async login(email, password) {
        try {
            console.log('=== AUTH.LOGIN START ===');
            console.log('Making login request for:', email);
            
            // Use AbortController to set a timeout for the request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log('Login response status:', response.status);
            console.log('Login response ok:', response.ok);
            
            const data = await response.json();
            console.log('Login response data:', data);
            
            if (!response.ok) {
                console.log('Login failed with status:', response.status);
                throw new Error(data.message || 'Login failed');
            }
            
            // Store token, username, and initial stats in localStorage
            localStorage.setItem('token', data.token);
            if (data.username) {
                localStorage.setItem('username', data.username);
            }
            if (data.stats) {
                localStorage.setItem('initialStats', JSON.stringify(data.stats));
                console.log('Stored initial stats:', data.stats);
            }
            
            const result = { success: true, stats: data.stats, username: data.username };
            console.log('Returning login result:', result);
            console.log('=== AUTH.LOGIN END ===');
            return result;
        } catch (error) {
            console.error('Auth.login error:', error);
            if (error.name === 'AbortError') {
                return { success: false, message: 'Request timed out. Please try again.' };
            }
            return { success: false, message: error.message };
        }
    },

    /**
     * Log out the current user by removing the token from localStorage.
     */
    logout() {
        localStorage.removeItem('token');
    },

    /**
     * Check if the user is currently authenticated (token exists).
     * @returns {boolean} True if authenticated, false otherwise
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    /**
     * Get the current authentication token from localStorage.
     * @returns {string|null} The token, or null if not found
     */
    getToken() {
        return localStorage.getItem('token');
    }
};
