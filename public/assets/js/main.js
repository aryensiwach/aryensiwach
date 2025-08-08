// Common bootstrap for all pages: load components and wire up auth UI
import { auth, provider, onAuthStateChanged, signInWithPopup, signOut, ensureUserDocument, ensureUserProgressDocument } from '/assets/js/firebase.js';

// Load and inject HTML components (navbar/footer)
async function loadComponent(targetSelector, componentPath) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  try {
    const res = await fetch(componentPath, { cache: 'no-cache' });
    const html = await res.text();
    target.innerHTML = html;
    if (componentPath.includes('navbar')) {
      initNavbarInteractions();
    }
    if (componentPath.includes('footer')) {
      const year = document.getElementById('year');
      if (year) year.textContent = new Date().getFullYear();
    }
  } catch (e) {
    console.error('Failed to load component', componentPath, e);
  }
}

// Initialize navbar buttons and responsive menu
function initNavbarInteractions() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
  }

  const signInBtn = document.getElementById('signin-btn');
  const signOutBtn = document.getElementById('signout-btn');

  if (signInBtn) {
    signInBtn.addEventListener('click', async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        await ensureUserDocument(result.user);
        await ensureUserProgressDocument(result.user.uid);
      } catch (err) {
        console.error('Sign-in failed', err);
        alert('Sign-in failed. Please try again.');
      }
    });
  }

  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('Sign-out failed', err);
        alert('Sign-out failed. Please try again.');
      }
    });
  }
}

// Reflect auth state in navbar UI
function bindAuthStateUI() {
  const userEmail = document.getElementById('user-email');
  const signInBtn = document.getElementById('signin-btn');
  const userMenu = document.getElementById('user-menu');
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (userEmail) userEmail.textContent = user.email || user.displayName || 'User';
      if (signInBtn) signInBtn.classList.add('hidden');
      if (userMenu) userMenu.classList.remove('hidden');
    } else {
      if (userEmail) userEmail.textContent = '';
      if (signInBtn) signInBtn.classList.remove('hidden');
      if (userMenu) userMenu.classList.add('hidden');
    }
  });
}

// Kick off on DOM ready
window.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadComponent('#navbar', '/components/navbar.html'),
    loadComponent('#footer', '/components/footer.html')
  ]);
  bindAuthStateUI();
});