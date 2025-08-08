// Project detail page: load project, render details, and allow marking as solved
import { auth, db, doc, getDoc, updateDoc, setDoc, arrayUnion, onAuthStateChanged } from '/assets/js/firebase.js';
import { ensureUserProgressDocument } from '/assets/js/firebase.js';

function getIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function chip(content, colorClass = 'bg-gray-100 text-gray-700') {
  return `<span class="text-xs ${colorClass} px-2 py-1 rounded">${content}</span>`;
}

function render(data) {
  document.getElementById('name').textContent = data.name || 'Untitled Project';
  if (data.category) document.getElementById('category').textContent = data.category;
  if (data.difficulty) document.getElementById('difficulty').textContent = data.difficulty;
  if (data.badge_reward) document.getElementById('badge').textContent = `Badge: ${data.badge_reward}`;
  document.getElementById('description').textContent = data.detailed_description || '';

  const lang = document.getElementById('languages');
  lang.innerHTML = (data.languages || []).map(l => chip(l)).join('');
  const tags = document.getElementById('tags');
  tags.innerHTML = (data.tags || []).map(t => chip(t)).join('');
}

async function markSolved(projectId, projectData) {
  const user = auth.currentUser;
  if (!user) {
    alert('Please sign in to mark as solved.');
    return;
  }
  const progressRef = await ensureUserProgressDocument(user.uid);
  await updateDoc(progressRef, { solved_projects: arrayUnion(projectId) });

  // Award badge if present
  if (projectData.badge_reward) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { badges: arrayUnion(projectData.badge_reward) }).catch(async (e) => {
      // If user doc doesn't exist (edge), create it quickly
      await setDoc(userRef, { badges: [projectData.badge_reward] }, { merge: true });
    });
  }

  const status = document.getElementById('status-msg');
  status.textContent = 'Marked as solved!';
  status.classList.remove('text-red-600');
  status.classList.add('text-emerald-700');
}

async function init() {
  const id = getIdFromQuery();
  if (!id) { window.location.href = '/projects.html'; return; }

  const ref = doc(db, 'projects', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    document.getElementById('status-msg').textContent = 'Project not found.';
    return;
  }
  const data = snap.data();
  render(data);

  document.getElementById('mark-solved').addEventListener('click', () => markSolved(id, data));
  document.getElementById('back-btn').addEventListener('click', () => { window.location.href = '/projects.html'; });

  onAuthStateChanged(auth, () => {/* trigger UI bind via navbar */});
}

window.addEventListener('DOMContentLoaded', init);