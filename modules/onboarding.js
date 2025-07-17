// PlayNotNPC Onboarding Module
// Shows a non-intrusive, on-theme onboarding for first-time users

const ONBOARDING_KEY = 'playnotnpc_onboarding_complete_v1'; // LocalStorage key to track onboarding completion

// Steps for the onboarding tour, each with a title, description, and optional highlight selector
const onboardingSteps = [
  {
    title: 'Welcome to PlayNotNPC!',
    desc: 'Transform your real life into an epic adventure. Let’s take a quick, smooth tour of your new dashboard!',
    highlight: null
  },
  {
    title: 'Add Your First Activity',
    desc: 'Use this form to log your workouts, work, or study sessions. Try adding something now!',
    highlight: '.entry-form-container'
  },
  {
    title: 'Track Your Progress',
    desc: 'See your recent activities and XP here. Watch your character grow as you log more!',
    highlight: '.entry-list-container'
  },
  {
    title: 'Plan & Organize',
    desc: 'Use the <b>Planner</b> to set goals, schedule activities, and stay on top of your quests. Tap the calendar icon in the menu!',
    highlight: '.nav-link[href="planner.html"]'
  },
  {
    title: 'Connect with Friends',
    desc: 'Add friends, see their progress, and motivate each other! Check out the Friends page from the menu.',
    highlight: '.nav-link[href="friends.html"]'
  },
  {
    title: 'Unlock Achievements',
    desc: 'Complete quests and milestones to earn achievements. Check out the Achievements page!',
    highlight: '.nav-link[href="achievements.html"]'
  }
];

let onboardingIndex = 0; // Current step index
let onboardingOverlay = null; // Reference to the overlay DOM element

/**
 * Create and display the onboarding overlay/modal for the current step.
 * Handles highlighting, progress dots, and button actions.
 */
function createOnboardingOverlay() {
  // Remove existing overlay if present
  if (onboardingOverlay) onboardingOverlay.remove();

  onboardingOverlay = document.createElement('div');
  onboardingOverlay.className = 'onboarding-overlay';
  onboardingOverlay.innerHTML = `
    <div class="onboarding-modal">
      <div class="onboarding-progress">
        ${onboardingSteps.map((_, i) => `<span class="onboarding-dot${i === onboardingIndex ? ' active' : ''}"></span>`).join('')}
      </div>
      <h2>${onboardingSteps[onboardingIndex].title}</h2>
      <p>${onboardingSteps[onboardingIndex].desc}</p>
      <div class="onboarding-actions">
        <button class="onboarding-skip">Skip</button>
        <button class="onboarding-next">${onboardingIndex === onboardingSteps.length - 1 ? 'Finish' : 'Next'}</button>
      </div>
    </div>
  `;
  document.body.appendChild(onboardingOverlay);

  // Remove previous highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
  const step = onboardingSteps[onboardingIndex];
  // Highlight the relevant element for this step, if any
  if (step.highlight) {
    const el = document.querySelector(step.highlight);
    if (el) el.classList.add('onboarding-highlight');
  }

  // Button handlers for skip and next/finish
  onboardingOverlay.querySelector('.onboarding-skip').onclick = finishOnboarding;
  onboardingOverlay.querySelector('.onboarding-next').onclick = () => {
    onboardingIndex++;
    if (onboardingIndex >= onboardingSteps.length) {
      finishOnboarding();
    } else {
      createOnboardingOverlay();
    }
  };
}

/**
 * Finish the onboarding process: set completion flag and clean up UI.
 */
function finishOnboarding() {
  localStorage.setItem(ONBOARDING_KEY, '1');
  if (onboardingOverlay) onboardingOverlay.remove();
  document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
}

/**
 * Start onboarding if the user hasn't completed it yet.
 * Exposed for use in app entry points.
 */
export function startOnboardingIfNeeded() {
  if (localStorage.getItem(ONBOARDING_KEY)) return;
  onboardingIndex = 0;
  createOnboardingOverlay();
}

// Inline styles for onboarding overlay and modal (can be moved to CSS file if desired)
const onboardingStyles = document.createElement('style');
onboardingStyles.innerHTML = `
.onboarding-overlay {
  position: fixed; z-index: 9999; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(10,10,20,0.75);
  display: flex; align-items: center; justify-content: center;
  animation: fadeInOnboarding 0.5s;
}
@keyframes fadeInOnboarding { from { opacity: 0; } to { opacity: 1; } }
.onboarding-modal {
  background: linear-gradient(135deg, #845ef7 0%, #5c7cfa 100%);
  color: #fff; border-radius: 20px; box-shadow: 0 8px 40px #0008;
  padding: 2.5rem 2rem; max-width: 350px; width: 90vw; text-align: center;
  position: relative; font-family: 'Poppins', sans-serif;
}
.onboarding-modal h2 { font-size: 1.5rem; margin-bottom: 1rem; }
.onboarding-modal p { font-size: 1.05rem; margin-bottom: 2rem; }
.onboarding-actions { display: flex; gap: 1rem; justify-content: center; }
.onboarding-actions button {
  background: linear-gradient(90deg, #a445f2, #fa4299, #ffb86c);
  color: #fff; border: none; border-radius: 8px; padding: 0.7em 1.5em;
  font-size: 1rem; font-weight: 600; cursor: pointer; transition: box-shadow 0.2s;
  box-shadow: 0 2px 8px #845ef733;
}
.onboarding-actions button:hover { box-shadow: 0 4px 16px #fa429955; }
.onboarding-progress { margin-bottom: 1.5rem; }
.onboarding-dot {
  display: inline-block; width: 10px; height: 10px; border-radius: 50%;
  background: #fff3; margin: 0 3px; transition: background 0.2s;
}
.onboarding-dot.active { background: #fff; }
.onboarding-highlight {
  box-shadow: 0 0 0 4px #fa4299cc, 0 0 32px #845ef7cc;
  border-radius: 18px !important;
  transition: box-shadow 0.3s;
  position: relative;
  z-index: 10000;
}
`;
document.head.appendChild(onboardingStyles); 