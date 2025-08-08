// Dashboard logic: enforce auth, load profile, solved items, and badges
import { auth, db, onAuthStateChanged, doc, getDoc, collection, getDocs } from '/assets/js/firebase.js';

async function loadProfile(userId) {
  const userSnap = await getDoc(doc(db, 'users', userId));
  const data = userSnap.data() || {};
  document.getElementById('profile-name').textContent = data.name || '';
  document.getElementById('profile-email').textContent = data.email || '';
  document.getElementById('profile-joined').textContent = (data.joined_at || '').toString().slice(0, 10);

  const badges = Array.isArray(data.badges) ? data.badges : [];
  const badgeEl = document.getElementById('badges');
  badgeEl.innerHTML = badges.length ? badges.map(b => `<span class='text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded'>${b}</span>`).join('') : '<span class="text-sm text-gray-500">No badges yet.</span>';
}

async function loadProgress(userId) {
  const progressSnap = await getDoc(doc(db, 'userProgress', userId));
  const progress = progressSnap.data() || { solved_projects: [], solved_internships: [] };

  // Load project names
  const projects = await getDocs(collection(db, 'projects'));
  const projectMap = new Map(projects.docs.map(d => [d.id, d.data()]));

  const solvedProjectsEl = document.getElementById('solved-projects');
  const solvedProjectsEmpty = document.getElementById('solved-projects-empty');
  const solvedProjects = (progress.solved_projects || []).filter(Boolean);
  if (solvedProjects.length) {
    solvedProjectsEmpty.classList.add('hidden');
    solvedProjectsEl.innerHTML = solvedProjects.map(id => {
      const p = projectMap.get(id) || {}; return `<a href='/project-detail.html?id=${id}' class='border border-gray-200 rounded p-3 text-sm hover:border-indigo-300'>${p.name || id}</a>`;
    }).join('');
  }

  // Load internship names
  const internships = await getDocs(collection(db, 'internships'));
  const internshipMap = new Map(internships.docs.map(d => [d.id, d.data()]));

  const solvedInternEl = document.getElementById('solved-internships');
  const solvedInternEmpty = document.getElementById('solved-internships-empty');
  const solvedInternships = (progress.solved_internships || []).filter(Boolean);
  if (solvedInternships.length) {
    solvedInternEmpty.classList.add('hidden');
    solvedInternEl.innerHTML = solvedInternships.map(id => {
      const it = internshipMap.get(id) || {}; return `<div class='border border-gray-200 rounded p-3 text-sm'>${it.name || id}</div>`;
    }).join('');
  }
}

function showAuthGuard(show) {
  document.getElementById('auth-guard').classList.toggle('hidden', !show);
  document.getElementById('profile-section').classList.toggle('hidden', show);
}

function init() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { showAuthGuard(true); return; }
    showAuthGuard(false);
    await Promise.all([loadProfile(user.uid), loadProgress(user.uid)]);
  });
}

window.addEventListener('DOMContentLoaded', init);