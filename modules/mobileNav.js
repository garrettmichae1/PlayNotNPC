// Mobile navigation functionality
export function initializeMobileNavigation() {
    console.log('🔧 Initializing mobile navigation...');
    
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Debug: Log element status
    console.log('Mobile nav elements found:', {
        mobileMenuToggle: !!mobileMenuToggle,
        sidebar: !!sidebar,
        sidebarOverlay: !!sidebarOverlay
    });

    if (!mobileMenuToggle || !sidebar || !sidebarOverlay) {
        console.warn('⚠️ Mobile navigation elements not found');
        console.warn('Missing elements:', {
            mobileMenuToggle: !mobileMenuToggle,
            sidebar: !sidebar,
            sidebarOverlay: !sidebarOverlay
        });
        return;
    }

    // Toggle mobile menu
    function toggleMobileMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🍔 Toggle mobile menu clicked');
        
        const isOpen = sidebar.classList.contains('mobile-open') || sidebar.classList.contains('active');
        
        console.log('Current menu state:', isOpen ? 'open' : 'closed');
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    // Open mobile menu
    function openMobileMenu() {
        console.log('📱 Opening mobile menu');
        sidebar.classList.add('mobile-open');
        sidebar.classList.add('active'); // Support both class names
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add visual feedback
        mobileMenuToggle.style.transform = 'rotate(90deg)';
        mobileMenuToggle.style.background = 'rgba(132, 94, 247, 1)';
    }

    // Close mobile menu
    function closeMobileMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('📱 Closing mobile menu');
        sidebar.classList.remove('mobile-open');
        sidebar.classList.remove('active'); // Support both class names
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset visual feedback
        mobileMenuToggle.style.transform = 'rotate(0deg)';
        mobileMenuToggle.style.background = 'rgba(132, 94, 247, 0.9)';
    }

    // Handle navigation link clicks
    function handleNavLinkClick(e, link) {
        e.preventDefault();
        e.stopPropagation();
        
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        
        console.log(`🔗 Nav link clicked: ${text} -> ${href}`);
        
        // Close mobile menu first
        closeMobileMenu();
        
        // Add a small delay to ensure menu closes before navigation
        setTimeout(() => {
            console.log(`🚀 Navigating to: ${href}`);
            
            // Use window.location for navigation
            if (href && href !== '#') {
                window.location.href = href;
            } else {
                console.warn('⚠️ No valid href found for navigation link');
            }
        }, 100);
    }

    // Enhanced event listeners with debugging
    function addEventListeners() {
        // Mobile menu toggle - multiple event types for better mobile support
        ['click', 'touchstart'].forEach(eventType => {
            mobileMenuToggle.addEventListener(eventType, toggleMobileMenu, { passive: false });
        });
        
        // Overlay close - multiple event types
        ['click', 'touchstart'].forEach(eventType => {
            sidebarOverlay.addEventListener(eventType, closeMobileMenu, { passive: false });
        });

        // Handle navigation links with proper navigation
        const navLinks = sidebar.querySelectorAll('.nav-link');
        console.log('Found nav links:', navLinks.length);
        
        navLinks.forEach((link, index) => {
            console.log(`🔗 Setting up nav link ${index + 1}:`, link.textContent.trim(), '->', link.getAttribute('href'));
            
            // Remove any existing event listeners to prevent duplicates
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // Add new event listeners
            ['click', 'touchstart'].forEach(eventType => {
                newLink.addEventListener(eventType, (e) => {
                    handleNavLinkClick(e, newLink);
                }, { passive: false });
            });
            
            // Add visual feedback for mobile
            newLink.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
                this.style.opacity = '0.8';
            });
            
            newLink.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
                this.style.opacity = '1';
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                console.log('⌨️ Escape key pressed - closing menu');
                closeMobileMenu();
            }
        });

        // Close menu on window resize (if switching to desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) {
                console.log('🖥️ Window resized to desktop - closing menu');
                closeMobileMenu();
            }
        });

        // Add touch feedback to mobile menu toggle
        mobileMenuToggle.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.9)';
        });
        
        mobileMenuToggle.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    }

    // Initialize event listeners
    addEventListeners();

    // Add mobile-specific CSS classes
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('mobile-device');
        console.log('📱 Mobile device detected');
    }

    // Debug: Log final state
    console.log('✅ Mobile navigation initialized successfully');
    console.log('Current viewport:', window.innerWidth + 'x' + window.innerHeight);
    console.log('Touch support:', 'ontouchstart' in window);
    console.log('Max touch points:', navigator.maxTouchPoints);
} 