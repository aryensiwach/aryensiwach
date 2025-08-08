// Internships page logic: fetch, filter, render, and mark as completed
import { auth, db, collection, getDocs, doc, updateDoc, arrayUnion } from '/assets/js/firebase.js';
import { ensureUserProgressDocument } from '/assets/js/firebase.js';

function createInternshipCard(id, data, onComplete) {
  const requirements = Array.isArray(data.requirements) ? data.requirements : [];
  return `
    <div class="border border-gray-200 rounded-lg p-5 flex flex-col">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">${data.name || 'Untitled Internship'}</h3>
        <span class="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700">${data.duration || 'N/A'}</span>
      </div>
      <p class="mt-2 text-sm text-gray-600 line-clamp-3">${data.description || ''}</p>
      <div class="mt-3 flex flex-wrap gap-2">${requirements.slice(0, 4).map(r => `<span class='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded'>${r}</span>`).join('')}</div>
      <div class="mt-4">
        <button data-id="${id}" class="complete-btn px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 w-full">Mark as Completed</button>
      </div>
    </div>`;
}

async function fetchAllInternships() {
  const snap = await getDocs(collection(db, 'internships'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function applyFilters(data, filters) {
  return data.filter(item => {
    const matchesSearch = !filters.search ||
      (item.name && item.name.toLowerCase().includes(filters.search)) ||
      (Array.isArray(item.requirements) && item.requirements.some(r => (r || '').toLowerCase().includes(filters.search)));
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesStatus = !filters.status || item.status === filters.status;
    return matchesSearch && matchesCategory && matchesStatus;
  });
}

function populateCategoryOptions(items) {
  const select = document.getElementById('filter-category');
  const categories = Array.from(new Set(items.map(p => p.category).filter(Boolean))).sort();
  for (const c of categories) {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c; select.appendChild(opt);
  }
}

async function markCompleted(internshipId) {
  const user = auth.currentUser;
  if (!user) { alert('Please sign in to track progress.'); return; }
  const progressRef = await ensureUserProgressDocument(user.uid);
  await updateDoc(progressRef, { solved_internships: arrayUnion(internshipId) });
  alert('Marked as completed!');
}

async function init() {
  const all = await fetchAllInternships();
  populateCategoryOptions(all);

  const urlParams = new URLSearchParams(window.location.search);
  const fromQuery = urlParams.get('search');
  if (fromQuery) document.getElementById('search-input').value = decodeURIComponent(fromQuery);

  const grid = document.getElementById('internships-grid');
  const empty = document.getElementById('internships-empty');

  const run = () => {
    const filters = {
      search: (document.getElementById('search-input').value || '').toLowerCase(),
      category: document.getElementById('filter-category').value,
      status: document.getElementById('filter-status').value
    };
    const filtered = applyFilters(all, filters);
    if (!filtered.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    grid.innerHTML = filtered.map(p => createInternshipCard(p.id, p)).join('');
    grid.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', () => markCompleted(btn.getAttribute('data-id')));
    });
  };

  document.getElementById('apply-filters').addEventListener('click', run);
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-status').value = '';
    run();
  });

  run();
}

window.addEventListener('DOMContentLoaded', init);