// Projects page logic: fetch, filter, and render project cards
import { db, collection, getDocs } from '/assets/js/firebase.js';

function createProjectCard(id, data) {
  const tags = Array.isArray(data.tags) ? data.tags : [];
  return `
    <a href="/project-detail.html?id=${id}" class="block border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">${data.name || 'Untitled Project'}</h3>
        <span class="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700">${data.difficulty || 'N/A'}</span>
      </div>
      <p class="mt-2 text-sm text-gray-600 line-clamp-3">${data.short_description || ''}</p>
      <div class="mt-3 flex flex-wrap gap-2">${tags.map(t => `<span class='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded'>${t}</span>`).join('')}</div>
    </a>`;
}

async function fetchAllProjects() {
  const snap = await getDocs(collection(db, 'projects'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function applyFilters(data, filters) {
  return data.filter(item => {
    const matchesSearch = !filters.search ||
      (item.name && item.name.toLowerCase().includes(filters.search)) ||
      (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(filters.search)));
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesDifficulty = !filters.difficulty || item.difficulty === filters.difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });
}

function populateCategoryOptions(projects) {
  const select = document.getElementById('filter-category');
  const categories = Array.from(new Set(projects.map(p => p.category).filter(Boolean))).sort();
  for (const c of categories) {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c; select.appendChild(opt);
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const empty = document.getElementById('projects-empty');
  if (!projects.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = projects.map(p => createProjectCard(p.id, p)).join('');
}

function getFiltersFromUI() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = (urlParams.get('search') || '').toLowerCase();

  return {
    search: (document.getElementById('search-input').value || initialSearch || '').toLowerCase(),
    category: document.getElementById('filter-category').value,
    difficulty: document.getElementById('filter-difficulty').value
  };
}

async function init() {
  const all = await fetchAllProjects();
  populateCategoryOptions(all);

  // Preload search from query param
  const urlParams = new URLSearchParams(window.location.search);
  const fromQuery = urlParams.get('search');
  if (fromQuery) document.getElementById('search-input').value = decodeURIComponent(fromQuery);

  const run = () => {
    const filtered = applyFilters(all, getFiltersFromUI());
    renderProjects(filtered);
  };

  document.getElementById('apply-filters').addEventListener('click', run);
  document.getElementById('clear-filters').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-difficulty').value = '';
    run();
  });

  // Run initial render
  run();
}

window.addEventListener('DOMContentLoaded', init);