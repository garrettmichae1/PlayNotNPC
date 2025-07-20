// planner.js
import { Storage } from './modules/storage.js';
import { Auth } from './modules/auth.js';

// Authenticate user
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// Add this helper for form notifications
function showFormNotification(message, type = 'warning') {
    const notification = document.createElement('div');
    notification.className = 'form-notification';
    
    const icon = type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
    const bgColor = type === 'warning' ? 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' : 
                   type === 'error' ? 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)' : 
                   'linear-gradient(135deg, #2196F3 0%, #4CAF50 100%)';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${icon}</div>
            <div class="notification-text">
                <h3>${type === 'warning' ? 'Please Check' : type === 'error' ? 'Error' : 'Info'}</h3>
                <p>${message}</p>
            </div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(255, 152, 0, 0.3);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 340px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        font-size: 16px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// --- STATE ---
let currentDate = new Date();
let selectedDate = null;
let plannedActivities = Storage.load('planned_activities') || [];

// --- DOM ELEMENTS ---
const monthYearHeader = document.getElementById('month-year-header');
const calendarGrid = document.getElementById('calendar-grid');
const selectedDayHeader = document.getElementById('selected-day-header');
const plannedList = document.getElementById('planned-list');
const predictedXpEl = document.getElementById('predicted-xp');
const planForm = document.getElementById('plan-form');

// --- RENDER FUNCTIONS ---

/**
 * Renders the calendar grid for the month specified in `currentDate`.
 */
function renderCalendar() {
    calendarGrid.innerHTML = ''; // Clear previous view
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearHeader.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add blank divs for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    // Add a div for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        dayEl.classList.add('calendar-day');

        const dayDate = new Date(year, month, day);

        // Add a marker if the day has planned activities
        if (plannedActivities.some(p => new Date(p.date).toDateString() === dayDate.toDateString())) {
            dayEl.classList.add('has-plan');
        }
        
        // Highlight today's date
        if (dayDate.toDateString() === new Date().toDateString()) {
            dayEl.classList.add('today');
        }

        dayEl.addEventListener('click', () => {
            selectedDate = dayDate;
            document.querySelectorAll('.calendar-day.selected').forEach(el => el.classList.remove('selected'));
            dayEl.classList.add('selected');
            renderDayDetails();
        });

        // Add touch events for mobile
        dayEl.addEventListener('touchstart', function(e) {
            console.log('Calendar day touched:', day);
            this.style.transform = 'scale(0.95)';
        }, { passive: true });

        dayEl.addEventListener('touchend', function(e) {
            this.style.transform = 'scale(1)';
        }, { passive: true });

        calendarGrid.appendChild(dayEl);
    }
}

/**
 * Renders the details (plans, predicted XP) for the `selectedDate`.
 */
function renderDayDetails() {
    if (!selectedDate) return;

    planForm.style.display = 'block'; // Show the form
    selectedDayHeader.textContent = `Plans for ${selectedDate.toLocaleDateString()}`;
    plannedList.innerHTML = '';

    const activitiesForDay = plannedActivities.filter(p => new Date(p.date).toDateString() === selectedDate.toDateString());

    let totalPredictedXp = 0;

    if (activitiesForDay.length === 0) {
        plannedList.innerHTML = '<li>No plans for this day yet.</li>';
    } else {
        activitiesForDay.forEach(activity => {
            const li = document.createElement('li');
            li.textContent = `[${activity.type}] ${activity.title} (+${activity.amount} XP)`;
            plannedList.appendChild(li);
            totalPredictedXp += activity.amount;
        });
    }

    predictedXpEl.textContent = totalPredictedXp;
}

// --- EVENT HANDLERS ---

/**
 * Handles adding a new planned activity.
 */
function handleAddPlan(event) {
    event.preventDefault();
    console.log(' Plan form submission started');
    
    if (!selectedDate) {
        showFormNotification("Please select a day from the calendar first!", "warning");
        return;
    }

    const titleInput = document.getElementById('plan-title');
    const amountInput = document.getElementById('plan-amount');
    const typeInput = document.getElementById('plan-type');
    const customPlanInput = document.getElementById('custom-plan-name');

    console.log('Form elements found:', {
        titleInput: !!titleInput,
        amountInput: !!amountInput,
        typeInput: !!typeInput,
        customPlanInput: !!customPlanInput
    });

    if (!titleInput || !amountInput || !typeInput) {
        console.error('Form elements not found');
        showFormNotification('Form elements not found. Please refresh the page.', 'error');
        return;
    }

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    let type = typeInput.value;

    // Handle custom activity type
    if (type === 'custom') {
        if (!customPlanInput || !customPlanInput.value.trim()) {
            showFormNotification("Please enter a custom activity name!", "warning");
            return;
        }
        type = customPlanInput.value.trim();
    }

    console.log('Form values:', { title, amount, type });

    if (!title || isNaN(amount) || amount <= 0) {
        showFormNotification("Please fill in all fields with valid values.", "warning");
        return;
    }

    const newPlan = {
        id: Date.now(), // Simple unique ID
        date: selectedDate.toISOString(),
        type,
        title,
        amount
    };

    console.log(' Adding new plan:', newPlan);

    plannedActivities.push(newPlan);
    Storage.save('planned_activities', plannedActivities);

    // Clear form
    planForm.reset();
    
    // Update UI
    renderCalendar();
    renderDayDetails();
    
    console.log('Plan added successfully');
    
    // Show success feedback
    const submitBtn = planForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Plan Added! ✓';
        submitBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.backgroundColor = '';
        }, 2000);
    }
}

// --- MOBILE OPTIMIZATIONS ---

// Add mobile-specific form improvements
function setupMobileFormOptimizations() {
    console.log(' Setting up mobile form optimizations for planner');
    
    if (!planForm) {
        console.error('Plan form not found');
        return;
    }

    // Add mobile-friendly styling to form inputs
    const inputs = planForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Set font size to prevent zoom on iOS
        input.style.fontSize = '16px';
        input.style.padding = '12px';
        input.style.minHeight = '44px';
        
        // Add visual feedback
        input.addEventListener('focus', function() {
            console.log('Input focused:', this.id);
            this.style.borderColor = '#667eea';
            this.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
        
        // Add touch feedback
        input.addEventListener('touchstart', function() {
            console.log('Input touched:', this.id);
            this.style.backgroundColor = '#f8f9ff';
        }, { passive: true });
        
        input.addEventListener('touchend', function() {
            this.style.backgroundColor = '';
        }, { passive: true });
    });

    // Enhance submit button
    const submitBtn = planForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.style.minHeight = '48px';
        submitBtn.style.fontSize = '16px';
        submitBtn.style.fontWeight = '600';
        
        // Store original text for reset
        submitBtn.setAttribute('data-original-text', submitBtn.textContent);
    }
}

// Attach event listeners
planForm.addEventListener('submit', handleAddPlan);

document.getElementById('prev-month-btn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month-btn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'login.html';
});

// --- INITIALIZATION ---
planForm.style.display = 'none'; // Hide form until a day is selected

// Add custom activity functionality
const typeSelect = document.getElementById('plan-type');
const customPlanGroup = document.getElementById('custom-plan-group');
const customPlanInput = document.getElementById('custom-plan-name');

if (typeSelect && customPlanGroup && customPlanInput) {
    typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'custom') {
            customPlanGroup.style.display = 'block';
            customPlanInput.required = true;
        } else {
            customPlanGroup.style.display = 'none';
            customPlanInput.required = false;
            customPlanInput.value = '';
        }
    });
}

renderCalendar();
setupMobileFormOptimizations();

console.log(' Planner initialized with mobile optimizations');
