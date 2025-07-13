// Mobile optimizations for better touch handling and functionality
export function initializeMobileOptimizations() {
    console.log('🔧 Initializing mobile optimizations...');

    // Detect mobile device
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    console.log('📱 Mobile device detected:', isMobile);
    console.log('Touch points:', navigator.maxTouchPoints);
    console.log('Viewport:', window.innerWidth + 'x' + window.innerHeight);

    if (isMobile) {
        document.body.classList.add('mobile-device');
    }

    // Add touch event handling to all buttons and interactive elements
    const interactiveSelectors = [
        'button', 
        '.nav-link', 
        'input[type="submit"]', 
        '.card', 
        '.tab-btn', 
        '.remove-btn',
        '.calendar-day',
        '.form-group input',
        '.form-group select',
        '.form-group textarea'
    ];

    interactiveSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Add touch event handling
            element.addEventListener('touchstart', function(e) {
                console.log('📱 Touch event on:', selector, this);
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            }, { passive: true });

            element.addEventListener('touchend', function(e) {
                console.log('📱 Touch end on:', selector, this);
                this.style.transform = 'scale(1)';
            }, { passive: true });

            // Add click event as fallback
            element.addEventListener('click', function(e) {
                console.log('📱 Click event on:', selector, this);
            });
        });
    });

    console.log('🎯 Found interactive elements:', document.querySelectorAll(interactiveSelectors.join(',')).length);

    // Enhanced form handling for mobile
    const forms = document.querySelectorAll('form');
    console.log('📝 Found forms:', forms.length);
    
    forms.forEach((form, index) => {
        console.log(`📝 Setting up form ${index + 1}:`, form.id || 'unnamed');
        
        // Add mobile-specific form improvements
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input, inputIndex) => {
            console.log(`📝 Input ${inputIndex + 1}:`, input.type, input.id || input.name);
            
            // Set font size to 16px to prevent zoom on iOS
            input.style.fontSize = '16px';
            
            // Add mobile-friendly padding
            input.style.padding = '12px';
            input.style.minHeight = '44px'; // Apple's recommended minimum touch target
            
            // Add visual feedback on focus
            input.addEventListener('focus', function() {
                console.log('📱 Input focused:', this.id || this.name);
                this.style.borderColor = '#667eea';
                this.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
            });
            
            input.addEventListener('blur', function() {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            });
            
            // Add touch feedback
            input.addEventListener('touchstart', function() {
                console.log('📱 Input touched:', this.id || this.name);
                this.style.backgroundColor = '#f8f9ff';
            }, { passive: true });
            
            input.addEventListener('touchend', function() {
                this.style.backgroundColor = '';
            }, { passive: true });
        });
        
        // Enhanced form submission for mobile (visual feedback only)
        form.addEventListener('submit', function(e) {
            console.log('📱 Form submission started (mobile feedback):', this.id || 'unnamed');
            
            // Add visual feedback only - don't prevent default or interfere with main handler
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.style.opacity = '0.7';
                submitBtn.textContent = 'Submitting...';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    submitBtn.style.opacity = '';
                    submitBtn.textContent = submitBtn.getAttribute('data-original-text') || 'Submit';
                }, 2000);
            }
        });
    });

    // Prevent pull-to-refresh on mobile
    let startY = 0;
    document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
        const y = e.touches[0].pageY;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop <= 0 && y > startY) {
            e.preventDefault();
        }
    }, { passive: false });

    // Enhanced modal handling for mobile
    const modals = document.querySelectorAll('.modal, .popup, .overlay');
    console.log('🪟 Found modals:', modals.length);
    
    modals.forEach(modal => {
        // Add touch-friendly close buttons
        const closeBtn = modal.querySelector('.close, .close-btn, [data-close]');
        if (closeBtn) {
            closeBtn.style.minHeight = '44px';
            closeBtn.style.minWidth = '44px';
            closeBtn.style.display = 'flex';
            closeBtn.style.alignItems = 'center';
            closeBtn.style.justifyContent = 'center';
        }
        
        // Close modal on overlay tap
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });

    // Enhanced chart handling for mobile
    const charts = document.querySelectorAll('canvas, .chart-container');
    console.log('📊 Found charts:', charts.length);
    
    charts.forEach(chart => {
        // Make charts responsive on mobile
        chart.style.maxWidth = '100%';
        chart.style.height = 'auto';
    });

    // Add mobile-specific CSS improvements
    const style = document.createElement('style');
    style.textContent = `
        .mobile-device {
            /* Prevent text selection on mobile */
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .mobile-device input,
        .mobile-device textarea,
        .mobile-device select {
            /* Allow text selection in form fields */
            -webkit-user-select: text;
            -khtml-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
        
        .mobile-device button,
        .mobile-device .nav-link,
        .mobile-device .calendar-day {
            /* Ensure minimum touch target size */
            min-height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .mobile-device .form-group {
            margin-bottom: 20px;
        }
        
        .mobile-device .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .mobile-device .form-group input,
        .mobile-device .form-group select,
        .mobile-device .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        .mobile-device .form-group input:focus,
        .mobile-device .form-group select:focus,
        .mobile-device .form-group textarea:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            outline: none;
        }
        
        .mobile-device button[type="submit"] {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .mobile-device button[type="submit"]:active {
            transform: scale(0.98);
        }
        
        .mobile-device .calendar-day {
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .mobile-device .calendar-day:active {
            transform: scale(0.95);
            background-color: #667eea;
            color: white;
        }
        
        /* Mobile-specific navigation improvements */
        .mobile-device .sidebar {
            width: 280px;
        }
        
        .mobile-device .nav-link {
            padding: 15px 20px;
            font-size: 16px;
        }
        
        /* Mobile-specific card improvements */
        .mobile-device .card {
            margin: 10px;
            padding: 20px;
            border-radius: 12px;
        }
    `;
    document.head.appendChild(style);
    console.log('🎨 Mobile CSS improvements added');

    // Add comprehensive debugging
    console.log('✅ Mobile optimizations initialized successfully');
    console.log('📱 Mobile device class added:', document.body.classList.contains('mobile-device'));
    console.log('🎯 Interactive elements enhanced:', document.querySelectorAll(interactiveSelectors.join(',')).length);
    console.log('📝 Forms optimized:', forms.length);
    console.log('🪟 Modals enhanced:', modals.length);
    console.log('📊 Charts responsive:', charts.length);
}

// Export test function for debugging
export function testMobileFunctionality() {
    console.log('🧪 Testing mobile functionality...');
    
    // Test touch detection
    console.log('Touch support:', 'ontouchstart' in window);
    console.log('Max touch points:', navigator.maxTouchPoints);
    
    // Test form elements
    const forms = document.querySelectorAll('form');
    forms.forEach((form, index) => {
        console.log(`Form ${index + 1}:`, {
            id: form.id,
            action: form.action,
            method: form.method,
            inputs: form.querySelectorAll('input, select, textarea').length
        });
    });
    
    // Test interactive elements
    const buttons = document.querySelectorAll('button');
    console.log('Buttons found:', buttons.length);
    
    const inputs = document.querySelectorAll('input, select, textarea');
    console.log('Inputs found:', inputs.length);
    
    // Test mobile detection
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    console.log('Mobile detected:', isMobile);
    
    return {
        touchSupport: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints,
        forms: forms.length,
        buttons: buttons.length,
        inputs: inputs.length,
        isMobile: isMobile
    };
} 