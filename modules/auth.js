// modules/auth.js
export const Auth = {
    async register(email, password) {
        try {
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
            
            // Store both token and username
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

    async login(email, password) {
        try {
            console.log('=== AUTH.LOGIN START ===');
            console.log('Making login request for:', email);
            
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
            
            console.log('Login successful, storing data...');
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

    logout() {
        localStorage.removeItem('token');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getToken() {
        return localStorage.getItem('token');
    }
};
