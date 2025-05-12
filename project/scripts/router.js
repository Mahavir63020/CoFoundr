import { auth } from './auth.js';
import { getProject } from './firestore.js';

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-link');
const createProjectBtn = document.getElementById('create-project-btn');

// Current page state
let currentPage = 'home';

// Initialize router
function initialize() {
    // Set up navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });

    // Set up create project button
    if (createProjectBtn) {
        createProjectBtn.addEventListener('click', () => {
            if (!auth.currentUser) {
                showToast('Please sign in to create a project', 'error');
                return;
            }
            navigateTo('create');
        });
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        const page = e.state?.page || 'home';
        navigateTo(page, false);
    });

    // Initial page load
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'home';
    const projectId = urlParams.get('id');
    
    if (projectId) {
        navigateTo('project', false, { projectId });
    } else {
        navigateTo(page, false);
    }
}

// Navigate to page
async function navigateTo(page, pushState = true, params = {}) {
    // Hide all pages
    pages.forEach(p => p.classList.remove('active'));
    
    // Show target page
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Update navigation
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
        
        // Update URL
        if (pushState) {
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            if (params.projectId) {
                url.searchParams.set('id', params.projectId);
            }
            window.history.pushState({ page, ...params }, '', url);
        }
        
        // Handle page-specific logic
        switch (page) {
            case 'project':
                if (params.projectId) {
                    await loadProjectDetails(params.projectId);
                }
                break;
            case 'applications':
                if (auth.currentUser) {
                    await loadApplications();
                } else {
                    showToast('Please sign in to view applications', 'error');
                    navigateTo('home');
                }
                break;
        }
        
        currentPage = page;
    }
}

// Load project details
async function loadProjectDetails(projectId) {
    try {
        const project = await getProject(projectId);
        if (project) {
            const projectDetails = document.getElementById('project-details');
            projectDetails.innerHTML = `
                <div class="project-header">
                    <h2>${project.title}</h2>
                    <span class="stage-badge ${project.stage.toLowerCase()}">${project.stage}</span>
                </div>
                <div class="project-content">
                    <section>
                        <h3>Problem</h3>
                        <p>${project.problem}</p>
                    </section>
                    <section>
                        <h3>Solution</h3>
                        <p>${project.solution}</p>
                    </section>
                    <section>
                        <h3>Project Summary</h3>
                        <p>${project.summary}</p>
                    </section>
                    ${project.url ? `
                        <section>
                            <h3>Project URL</h3>
                            <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.url}</a>
                        </section>
                    ` : ''}
                    <section>
                        <h3>Required Roles</h3>
                        <div class="roles-list">
                            ${project.roles.map(role => `
                                <span class="role-tag">${role}</span>
                            `).join('')}
                        </div>
                    </section>
                </div>
                ${auth.currentUser ? `
                    <button id="apply-btn" class="btn btn-primary">Apply Now</button>
                ` : `
                    <button id="login-to-apply-btn" class="btn btn-primary">Sign in to Apply</button>
                `}
            `;
            
            // Set up apply button
            const applyBtn = document.getElementById('apply-btn');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    showApplicationForm(project);
                });
            }
            
            // Set up login to apply button
            const loginToApplyBtn = document.getElementById('login-to-apply-btn');
            if (loginToApplyBtn) {
                loginToApplyBtn.addEventListener('click', () => {
                    document.getElementById('auth-modal').classList.remove('hidden');
                });
            }
        } else {
            showToast('Project not found', 'error');
            navigateTo('home');
        }
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Error loading project', 'error');
    }
}

// Show application form
function showApplicationForm(project) {
    const applicationForm = document.getElementById('application-form');
    applicationForm.innerHTML = `
        <h3>Apply for ${project.title}</h3>
        <form id="submit-application-form">
            ${project.questions.map((question, index) => `
                <div class="form-group">
                    <label for="answer-${index}">${question}</label>
                    <textarea id="answer-${index}" required></textarea>
                </div>
            `).join('')}
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Submit Application</button>
                <button type="button" class="btn btn-secondary" onclick="hideApplicationForm()">Cancel</button>
            </div>
        </form>
    `;
    
    applicationForm.classList.remove('hidden');
    
    // Handle form submission
    const form = document.getElementById('submit-application-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitApplication(project);
    });
}

// Hide application form
function hideApplicationForm() {
    const applicationForm = document.getElementById('application-form');
    applicationForm.classList.add('hidden');
}

// Submit application
async function submitApplication(project) {
    try {
        const answers = project.questions.map((_, index) => 
            document.getElementById(`answer-${index}`).value
        );
        
        await createApplication(project.id, auth.currentUser.uid, {
            answers,
            status: 'pending'
        });
        
        showToast('Application submitted successfully', 'success');
        hideApplicationForm();
    } catch (error) {
        console.error('Error submitting application:', error);
        showToast('Error submitting application', 'error');
    }
}

// Load applications
async function loadApplications() {
    try {
        const applications = await getUserApplications(auth.currentUser.uid);
        const applicationsList = document.getElementById('applications-list');
        
        if (applications.length === 0) {
            applicationsList.innerHTML = `
                <div class="no-applications">
                    <p>You haven't applied to any projects yet</p>
                </div>
            `;
            return;
        }
        
        applicationsList.innerHTML = applications.map(app => `
            <div class="application-card">
                <h3>${app.project.title}</h3>
                <span class="status-badge ${app.status.toLowerCase()}">${app.status}</span>
                <p>Applied ${formatTimestamp(app.createdAt)}</p>
                <a href="#" class="view-application-btn" data-id="${app.id}">View Application</a>
            </div>
        `).join('');
        
        // Set up view application buttons
        document.querySelectorAll('.view-application-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const applicationId = e.target.dataset.id;
                showApplicationDetails(applicationId);
            });
        });
    } catch (error) {
        console.error('Error loading applications:', error);
        showToast('Error loading applications', 'error');
    }
}

// Show application details
function showApplicationDetails(applicationId) {
    // Implementation for showing application details
    // This would typically show a modal with the full application details
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize); 