// Activity class for tracking user activities
export class Activity {
    constructor(type, title, amount) {
        this.type = type;
        this.title = title;
        this.amount = amount;
        this.date = new Date().toISOString();
    }
}

// --- AUTHENTICATION ---
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// --- STATE & INITIALIZATION ---
const xpManager = new XPManager();
// FIX: Initialize with an empty array if storage is empty to prevent errors.
let activities = Storage.load('activities') || [];

// --- DOM ELEMENTS ---
// FIX: Using correct selectors for the new HTML structure.
const entryList = document.querySelector('.entry-list');
const diaryForm = document.getElementById('diary-form');
const logoutBtn = document.querySelector('.logout-btn');
const levelDisplay = document.querySelector('.level');
const xpLabel = document.querySelector('.xp-bar label');
const xpProgress = document.getElementById('xp-progress');


// --- RENDER FUNCTIONS ---

/**
 * FIX: Rewritten to render activities into the new card-based list structure.
 * It now creates detailed list items instead of simple text.
 */
function renderEntries() {
    entryList.innerHTML = ''; // Clear existing entries

    // Show the most recent activities first by iterating a reversed copy of the array.
    [...activities].reverse().forEach(activity => {
        const li = document.createElement('li');
        li.className = 'card entry-item';

        li.innerHTML = `
            <div class="entry-details">
                <span class="entry-category">[${activity.type.toUpperCase()}]</span>
                <p class="entry-description">${activity.title}</p>
            </div>
            <div class="entry-meta">
                <span class="entry-value">+${activity.amount} XP</span>
                <span class="entry-date">${new Date(activity.date).toLocaleDateString()}</span>
            </div>
        `;
        entryList.appendChild(li);
    });
}

/**
 * FIX: Rewritten to update the individual stats elements in the sidebar.
 */
function renderStats() {
    const stats = xpManager.getStats(); // Assumes this returns { xp, level, xpForNextLevel }
    
    levelDisplay.textContent = `Level: ${stats.level}`;
    xpLabel.textContent = `XP: ${stats.xp} / ${stats.xpForNextLevel}`;
    xpProgress.value = stats.xp;
    xpProgress.max = stats.xpForNextLevel;
}


// --- EVENT HANDLERS ---

/**
 * FIX: Changed to handle form 'submit' event.
 * Prevents page refresh and uses correct element IDs to get values.
 */
function handleAddEntry(event) {
    event.preventDefault(); // Stop the form from reloading the page

    // Use new element IDs
    const titleInput = document.getElementById('entry-description');
    const amountInput = document.getElementById('entry-value');
    const typeInput = document.getElementById('entry-type');

    if (!titleInput.value || isNaN(parseFloat(amountInput.value)) || parseFloat(amountInput.value) <= 0) {
        alert("Please fill in all fields with valid data!");
        return;
    }

    const newActivity = new Activity(typeInput.value, titleInput.value, parseFloat(amountInput.value));
    
    // Update state and storage
    activities.push(newActivity);
    xpManager.addXP(newActivity);
    Storage.save('activities', activities);

    // Update the UI
    renderStats();
    renderEntries();

    diaryForm.reset(); // Clear the form fields
}

function handleLogout() {
    Auth.logout();
    window.location.href = 'login.html';
}

// --- ATTACH EVENT LISTENERS ---
// FIX: Listens for the form's 'submit' event, which is better practice.
diaryForm.addEventListener('submit', handleAddEntry);
logoutBtn.addEventListener('click', handleLogout);


// --- INITIAL PAGE LOAD ---
// Recalculate stats from all stored activities on page load.
xpManager.recalculateFromActivities(activities);
renderStats();
renderEntries();