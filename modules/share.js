// PlayNotNPC Share Module
// Provides safe, modular sharing for achievements and more

// Share an element as an image (Web Share API or download fallback)
export async function shareElementAsImage(element, title = 'PlayNotNPC Achievement') {
  if (!window.html2canvas) {
    alert('Sharing is not supported in this browser.');
    return;
  }
  try {
    const canvas = await window.html2canvas(element, { backgroundColor: null });
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `${title}.png`, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        files: [file],
        text: `I just unlocked an achievement in PlayNotNPC!`
      });
    } else {
      // Fallback: download image
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${title}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    alert('Could not share this achievement.');
    console.error('Share error:', err);
  }
}

// Add a share button to an achievement notification
export function addShareButtonToAchievement(notificationEl, achievementTitle) {
  if (!notificationEl || notificationEl.querySelector('.share-btn')) return;
  const btn = document.createElement('button');
  btn.className = 'share-btn';
  btn.innerHTML = 'Share <svg width="18" height="18" style="vertical-align:middle;margin-left:4px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>';
  btn.style.background = 'linear-gradient(90deg, #a445f2, #fa4299, #ffb86c)';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.padding = '0.5em 1.2em';
  btn.style.fontWeight = '600';
  btn.style.fontSize = '1rem';
  btn.style.cursor = 'pointer';
  btn.style.marginTop = '1rem';
  btn.style.boxShadow = '0 2px 8px #845ef733';
  btn.style.transition = 'box-shadow 0.2s';
  btn.onmouseover = () => btn.style.boxShadow = '0 4px 16px #fa429955';
  btn.onmouseout = () => btn.style.boxShadow = '0 2px 8px #845ef733';
  btn.onclick = (e) => {
    e.stopPropagation();
    shareElementAsImage(notificationEl, achievementTitle);
  };
  notificationEl.appendChild(btn);
} 