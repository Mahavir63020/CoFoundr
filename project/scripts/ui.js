import { auth } from './auth.js';
import { getProjects, getNotifications, markNotificationAsRead } from './firestore.js';

// DOM Elements
const searchInput = document.getElementById('search-input');
const stageFilter = document.getElementById('stage-filter');
const roleFilter = document.getElementById('role-filter');
const projectsGrid = document.getElementById('projects-grid');
const notificationBtn = document.getElementById('notification-btn');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationBadge = document.getElementById('notification-badge');

// State
let currentFilters = {
    search: '',
    stage: '',
    role: ''
};

// Initialize UI
function initialize() {
    setupEventListeners();
    loadProjects();
    
    // Check for authenticated user
    if (auth.currentUser) {
        loadNotifications();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value;
            loadProjects();
        });
    }

    // Stage filter
    if (stageFilter) {
        stageFilter.addEventListener('change', (e) => {
            currentFilters.stage = e.target.value;
            loadProjects();
        });
    }

    // Role filter
    if (roleFilter) {
        roleFilter.addEventListener('change', (e) => {
            currentFilters.role = e.target.value;
            loadProjects();
        });
    }

    // Notification button
    if (notificationBtn) {
        notificationBtn.addEventListener('click', () => {
            notificationDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
    }
}

// Load projects
async function loadProjects() {
    try {
        const projects = await getProjects(currentFilters);
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        showToast('Error loading projects', 'error');
    }
}

// Render projects
function renderProjects(projects) {
    if (!projectsGrid) return;

    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects">
                <p>No projects found matching your criteria</p>
            </div>
        `;
        return;
    }

    projectsGrid.innerHTML = projects.map(project => createProjectCard(project)).join('');
}

// Create project card
function createProjectCard(project) {
    return `
        <div class="project-card">
            <h3>${project.title}</h3>
            <span class="stage-badge ${project.stage.toLowerCase()}">${project.stage}</span>
            <p>${project.summary}</p>
            <div class="roles">
                ${project.roles.map(role => `
                    <span class="role-tag">${role}</span>
                `).join('')}
            </div>
            <a href="#" class="view-project-btn" data-id="${project.id}">View Details</a>
        </div>
    `;
}

// Load notifications
async function loadNotifications() {
    try {
        const notifications = await getNotifications(auth.currentUser.uid);
        renderNotifications(notifications);
        updateNotificationBadge(notifications);
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Render notifications
function renderNotifications(notifications) {
    if (!notificationDropdown) return;

    if (notifications.length === 0) {
        notificationDropdown.innerHTML = `
            <div class="no-notifications">
                <p>No notifications</p>
            </div>
        `;
        return;
    }

    notificationDropdown.innerHTML = notifications.map(notification => 
        createNotificationItem(notification)
    ).join('');
}

// Create notification item
function createNotificationItem(notification) {
    return `
        <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
            <p>${notification.message}</p>
            <small>${formatTimestamp(notification.createdAt)}</small>
        </div>
    `;
}

// Update notification badge
function updateNotificationBadge(notifications) {
    if (!notificationBadge) return;

    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'block';
    } else {
        notificationBadge.style.display = 'none';
    }
}

// Show toast message
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize); 