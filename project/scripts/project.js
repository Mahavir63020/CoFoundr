import { auth } from './auth.js';
import { getProject, createApplication, getApplications } from './firestore.js';

// DOM Elements
const projectTitle = document.getElementById('projectTitle');
const projectStage = document.getElementById('projectStage');
const projectTeamSize = document.getElementById('projectTeamSize');
const projectTimeCommitment = document.getElementById('projectTimeCommitment');
const projectSummary = document.getElementById('projectSummary');
const projectProblem = document.getElementById('projectProblem');
const projectSolution = document.getElementById('projectSolution');
const projectTargetAudience = document.getElementById('projectTargetAudience');
const rolesList = document.getElementById('rolesList');
const teamGrid = document.getElementById('teamGrid');
const creatorProfile = document.getElementById('creatorProfile');
const applicationModal = document.getElementById('applicationModal');
const modalRoleTitle = document.getElementById('modalRoleTitle');
const questionsContainer = document.getElementById('questionsContainer');
const applicationForm = document.getElementById('applicationForm');
const cancelApplication = document.getElementById('cancelApplication');

// State
let currentProject = null;
let selectedRole = null;

// Initialize
function initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
        window.location.href = '/';
        return;
    }

    loadProject(projectId);
    setupEventListeners();
}

// Load Project
async function loadProject(projectId) {
    try {
        currentProject = await getProject(projectId);
        if (!currentProject) {
            showToast('Project not found', 'error');
            window.location.href = '/';
            return;
        }

        renderProject();
        loadApplications();
    } catch (error) {
        console.error('Error loading project:', error);
        showToast('Error loading project', 'error');
    }
}

// Render Project
function renderProject() {
    // Basic Info
    projectTitle.textContent = currentProject.title;
    projectStage.textContent = `Stage: ${currentProject.stage}`;
    projectTeamSize.textContent = `Team Size: ${currentProject.teamSize}`;
    projectTimeCommitment.textContent = `Time: ${currentProject.timeCommitment}`;
    
    // Content
    projectSummary.textContent = currentProject.summary;
    projectProblem.textContent = currentProject.problem;
    projectSolution.textContent = currentProject.solution;
    projectTargetAudience.textContent = currentProject.targetAudience;

    // Creator Profile
    renderCreatorProfile();

    // Roles
    renderRoles();

    // Team Members
    renderTeamMembers();
}

// Render Creator Profile
function renderCreatorProfile() {
    creatorProfile.innerHTML = `
        <img src="${currentProject.creator.photoURL}" alt="${currentProject.creator.displayName}">
        <div class="creator-info">
            <h3>${currentProject.creator.displayName}</h3>
            <p>Project Creator</p>
        </div>
    `;
}

// Render Roles
function renderRoles() {
    rolesList.innerHTML = currentProject.roles.map(role => `
        <div class="role-card">
            <h3>${role}</h3>
            <div class="role-actions">
                <button class="btn btn-primary apply-btn" data-role="${role}">
                    Apply for this Role
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to apply buttons
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', () => openApplicationModal(button.dataset.role));
    });
}

// Render Team Members
function renderTeamMembers() {
    // For now, just show the creator
    teamGrid.innerHTML = `
        <div class="team-member">
            <img src="${currentProject.creator.photoURL}" alt="${currentProject.creator.displayName}">
            <h3>${currentProject.creator.displayName}</h3>
            <p>Project Creator</p>
        </div>
    `;
}

// Load Applications
async function loadApplications() {
    if (!auth.currentUser) return;

    try {
        const applications = await getApplications(currentProject.id);
        updateApplyButtons(applications);
    } catch (error) {
        console.error('Error loading applications:', error);
    }
}

// Update Apply Buttons
function updateApplyButtons(applications) {
    const userApplications = applications.filter(app => app.userId === auth.currentUser.uid);
    
    document.querySelectorAll('.apply-btn').forEach(button => {
        const role = button.dataset.role;
        const application = userApplications.find(app => app.role === role);
        
        if (application) {
            button.textContent = `Application ${application.status}`;
            button.disabled = true;
            button.classList.remove('btn-primary');
            button.classList.add('btn-secondary');
        }
    });
}

// Application Modal
function openApplicationModal(role) {
    if (!auth.currentUser) {
        showToast('Please sign in to apply', 'error');
        return;
    }

    selectedRole = role;
    modalRoleTitle.textContent = role;
    
    // Render questions
    questionsContainer.innerHTML = currentProject.questions.map((question, index) => `
        <div class="form-group">
            <label for="answer${index}">${question}</label>
            <textarea id="answer${index}" name="answer${index}" required></textarea>
        </div>
    `).join('');

    applicationModal.classList.add('active');
}

function closeApplicationModal() {
    applicationModal.classList.remove('active');
    selectedRole = null;
    applicationForm.reset();
}

// Setup Event Listeners
function setupEventListeners() {
    // Application Modal
    cancelApplication.addEventListener('click', closeApplicationModal);
    applicationModal.addEventListener('click', (e) => {
        if (e.target === applicationModal) {
            closeApplicationModal();
        }
    });

    // Application Form
    applicationForm.addEventListener('submit', handleApplicationSubmit);
}

// Handle Application Submit
async function handleApplicationSubmit(e) {
    e.preventDefault();

    if (!auth.currentUser) {
        showToast('Please sign in to apply', 'error');
        return;
    }

    try {
        const answers = currentProject.questions.map((_, index) => 
            document.getElementById(`answer${index}`).value
        );

        const applicationData = {
            role: selectedRole,
            answers,
            status: 'pending',
            createdAt: new Date()
        };

        await createApplication(currentProject.id, auth.currentUser.uid, applicationData);
        
        showToast('Application submitted successfully!', 'success');
        closeApplicationModal();
        loadApplications(); // Refresh applications list
    } catch (error) {
        console.error('Error submitting application:', error);
        showToast('Error submitting application', 'error');
    }
}

// Toast Message
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
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

// Initialize the page
initialize(); 