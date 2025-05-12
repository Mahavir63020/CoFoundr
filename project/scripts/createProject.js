import { auth } from './auth.js';
import { createProject } from './firestore.js';

// DOM Elements
const form = document.getElementById('create-project-form');
const steps = document.querySelectorAll('.step');
const formSteps = document.querySelectorAll('.form-step');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');

// State
let currentStep = 0;

// Initialize form
function initialize() {
    if (!form) return;
    
    setupEventListeners();
    updateStep();
}

// Set up event listeners
function setupEventListeners() {
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', previousStep);
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', nextStep);
    }

    // Submit button
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    // Role management
    const addRoleBtn = document.getElementById('add-role-btn');
    const rolesContainer = document.getElementById('roles-container');
    
    if (addRoleBtn && rolesContainer) {
        addRoleBtn.addEventListener('click', () => addRole(rolesContainer));
    }

    // Question management
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    
    if (addQuestionBtn && questionsContainer) {
        addQuestionBtn.addEventListener('click', () => addQuestion(questionsContainer));
    }
}

// Navigate to previous step
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        updateStep();
    }
}

// Navigate to next step
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateStep();
        }
    }
}

// Update step UI
function updateStep() {
    // Update step indicators
    steps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });

    // Update form steps
    formSteps.forEach((step, index) => {
        step.classList.toggle('active', index === currentStep);
    });

    // Update buttons
    if (prevBtn) {
        prevBtn.style.display = currentStep === 0 ? 'none' : 'block';
    }

    if (nextBtn) {
        nextBtn.style.display = currentStep === steps.length - 1 ? 'none' : 'block';
    }

    if (submitBtn) {
        submitBtn.style.display = currentStep === steps.length - 1 ? 'block' : 'none';
    }
}

// Validate current step
function validateCurrentStep() {
    const currentFormStep = formSteps[currentStep];
    const requiredFields = currentFormStep.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });

    if (!isValid) {
        showToast('Please fill in all required fields', 'error');
    }

    return isValid;
}

// Add role field
function addRole(container) {
    const roleDiv = document.createElement('div');
    roleDiv.className = 'role-input';
    roleDiv.innerHTML = `
        <input type="text" placeholder="Enter role" required>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(roleDiv);
}

// Add question field
function addQuestion(container) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-input';
    questionDiv.innerHTML = `
        <textarea placeholder="Enter question" required></textarea>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(questionDiv);
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateCurrentStep()) {
        return;
    }

    try {
        // Collect form data
        const formData = {
            title: document.getElementById('title').value,
            stage: document.getElementById('stage').value,
            problem: document.getElementById('problem').value,
            solution: document.getElementById('solution').value,
            summary: document.getElementById('summary').value,
            url: document.getElementById('url').value,
            roles: Array.from(document.querySelectorAll('.role-input input')).map(input => input.value),
            questions: Array.from(document.querySelectorAll('.question-input textarea')).map(textarea => textarea.value)
        };

        // Create project
        await createProject(formData);
        
        showToast('Project created successfully', 'success');
        
        // Reset form and navigate to home
        form.reset();
        window.history.pushState({ page: 'home' }, '', '/?page=home');
        document.getElementById('home-page').classList.add('active');
        document.getElementById('create-page').classList.remove('active');
        
    } catch (error) {
        console.error('Error creating project:', error);
        showToast('Error creating project', 'error');
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initialize); 