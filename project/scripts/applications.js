import { auth } from './auth.js';
import { getUserApplications, updateApplicationStatus } from './firestore.js';

// DOM Elements
const applicationsList = document.getElementById('applications-list');
const applicationDetails = document.getElementById('application-details');

// Initialize applications
function initialize() {
    if (!applicationsList) return;
    
    loadApplications();
}

// Load applications
async function loadApplications() {
    try {
        const applications = await getUserApplications(auth.currentUser.uid);
        renderApplications(applications);
    } catch (error) {
        console.error('Error loading applications:', error);
        showToast('Error loading applications', 'error');
    }
}

// Render applications
function renderApplications(applications) {
    if (!applicationsList) return;

    if (applications.length === 0) {
        applicationsList.innerHTML = `
            <div class="no-applications">
                <p>You haven't applied to any projects yet</p>
            </div>
        `;
        return;
    }

    applicationsList.innerHTML = applications.map(application => `
        <div class="application-card">
            <h3>${application.project.title}</h3>
            <span class="status-badge ${application.status.toLowerCase()}">${application.status}</span>
            <p>Applied ${formatTimestamp(application.createdAt)}</p>
            <button class="view-application-btn" data-id="${application.id}">View Application</button>
        </div>
    `).join('');

    // Set up view application buttons
    document.querySelectorAll('.view-application-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const applicationId = btn.dataset.id;
            showApplicationDetails(applicationId);
        });
    });
}

// Show application details
async function showApplicationDetails(applicationId) {
    try {
        const applications = await getUserApplications(auth.currentUser.uid);
        const application = applications.find(app => app.id === applicationId);
        
        if (!application) {
            showToast('Application not found', 'error');
            return;
        }

        if (!applicationDetails) return;

        applicationDetails.innerHTML = `
            <div class="application-details-content">
                <h2>${application.project.title}</h2>
                <span class="status-badge ${application.status.toLowerCase()}">${application.status}</span>
                <p class="application-date">Applied ${formatTimestamp(application.createdAt)}</p>
                
                <div class="application-answers">
                    ${application.answers.map((answer, index) => `
                        <div class="answer-item">
                            <h4>${application.project.questions[index]}</h4>
                            <p>${answer}</p>
                        </div>
                    `).join('')}
                </div>
                
                ${application.status === 'pending' ? `
                    <div class="application-actions">
                        <button class="btn btn-secondary" onclick="withdrawApplication('${applicationId}')">Withdraw Application</button>
                    </div>
                ` : ''}
            </div>
        `;

        applicationDetails.classList.remove('hidden');
    } catch (error) {
        console.error('Error loading application details:', error);
        showToast('Error loading application details', 'error');
    }
}

// Withdraw application
async function withdrawApplication(applicationId) {
    try {
        await updateApplicationStatus(applicationId, 'withdrawn');
        showToast('Application withdrawn successfully', 'success');
        loadApplications();
        applicationDetails.classList.add('hidden');
    } catch (error) {
        console.error('Error withdrawing application:', error);
        showToast('Error withdrawing application', 'error');
    }
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
initialize(); 