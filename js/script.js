let icons = []; 
let filteredIcons = [];
let displayedIcons = [];
let currentPage = 1;
const itemsPerPage = 18;
let activeFilter = 'all';
let isDarkMode = false;

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('search');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('load-more');
const themeToggle = document.getElementById('theme-toggle');
const totalCountEl = document.getElementById('total-count');
const displayedCountEl = document.getElementById('displayed-count');
const toastEl = document.getElementById('toast');


// 3. CORE LOGIC FUNCTIONS
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

async function loadIcons() {
    try {
        const response = await fetch('icons.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const iconData = await response.json();
        
        const svgIcons = iconData.svgIcon.map(fileName => ({
            name: fileName.replace('.svg', ''),
            type: 'svg',
            url: `assets/svg/${fileName}`
        }));

        const pngIcons = iconData.pngIcon.map(fileName => ({
            name: fileName.replace('.png', ''),
            type: 'png',
            url: `assets/png/${fileName}`
        }));

        icons = [...svgIcons, ...pngIcons];
        shuffle(icons);
        
        totalCountEl.textContent = icons.length;
        filterIcons();
    } catch (error) {
        console.error("Could not load icons:", error);
        gallery.innerHTML = `<div class="empty-state"><h3>Error loading icons.</h3><p>Please check the console for details.</p></div>`;
    }
}

window.handleImageError = function(img) {
    const parent = img.parentElement;
    parent.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'icon-placeholder';
    div.textContent = `Icon not found: ${img.alt}`; 
    parent.appendChild(div);
};

function setupEventListeners() {
    searchInput.addEventListener('input', filterIcons);
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeFilter = button.dataset.filter;
            currentPage = 1;
            filterIcons();
        });
    });
    loadMoreBtn.addEventListener('click', loadMoreIcons);
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light'); // Set on body for general selectors
    
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    if (isDarkMode) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function filterIcons() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    filteredIcons = icons.filter(icon => {
        const matchesSearch = icon.name.toLowerCase().includes(searchTerm);
        const matchesFilter = activeFilter === 'all' || icon.type === activeFilter;
        return matchesSearch && matchesFilter;
    });
    currentPage = 1;
    renderGallery();
}

function renderGallery() {
    gallery.innerHTML = '';
    if (filteredIcons.length === 0) {
        gallery.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"></path>
                </svg>
                <h3>No icons found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        loadMoreBtn.disabled = true;
        displayedCountEl.textContent = '0';
        return;
    }
    
    const endIndex = Math.min(currentPage * itemsPerPage, filteredIcons.length);
    displayedIcons = filteredIcons.slice(0, endIndex);
    displayedCountEl.textContent = displayedIcons.length;
    
    displayedIcons.forEach(icon => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        
        const img = document.createElement('img');
        img.src = icon.url;
        img.alt = icon.name;
        img.style.maxWidth = '80%';
        img.style.maxHeight = '80%';
        img.style.objectFit = 'contain';
        img.loading = 'lazy';
        img.onerror = () => handleImageError(img);
        
        iconContainer.appendChild(img);
        
        const cardContent = document.createElement('div');
        cardContent.className = 'card-content';
        
        const nameEl = document.createElement('div');
        nameEl.className = 'icon-name';
        nameEl.textContent = icon.name;
        
        const typeEl = document.createElement('span');
        typeEl.className = `icon-type type-${icon.type}`;
        typeEl.textContent = icon.type.toUpperCase();
        
        cardContent.appendChild(nameEl);
        cardContent.appendChild(typeEl);

        const downloadBtn = document.createElement('a');
        downloadBtn.href = icon.url;
        downloadBtn.download = icon.name + '.' + icon.type;
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download</span>`;
        
        cardContent.appendChild(downloadBtn);
        
        card.appendChild(iconContainer);
        card.appendChild(cardContent);
        
        gallery.appendChild(card);
    });
    loadMoreBtn.disabled = displayedIcons.length >= filteredIcons.length;
    
    if (displayedIcons.length < filteredIcons.length && currentPage > 0) {
            loadMoreBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Load More (${filteredIcons.length - displayedIcons.length} remaining)
            `;
    } else if (displayedIcons.length === filteredIcons.length) {
        loadMoreBtn.textContent = 'End of list';
    }
}

function loadMoreIcons() {
    currentPage++;
    renderGallery();
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function init() {
    loadIcons();
    setupEventListeners();
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Initial dark mode check (for user preference)
        isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
        document.querySelector('.sun-icon').style.display = 'none';
        document.querySelector('.moon-icon').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', init);