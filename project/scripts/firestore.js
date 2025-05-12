import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Projects Collection
export async function createProject(projectData) {
    try {
        const docRef = await addDoc(collection(window.db, 'projects'), {
            ...projectData,
            createdAt: serverTimestamp(),
            active: true
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

export async function getProjects(filters = {}) {
    try {
        let q = collection(window.db, 'projects');
        
        if (filters.stage) {
            q = query(q, where('stage', '==', filters.stage));
        }
        
        if (filters.role) {
            q = query(q, where('roles', 'array-contains', filters.role));
        }
        
        q = query(q, where('active', '==', true), orderBy('createdAt', 'desc'));
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting projects:', error);
        throw error;
    }
}

export async function getProject(projectId) {
    try {
        const docRef = doc(window.db, 'projects', projectId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting project:', error);
        throw error;
    }
}

// Applications Collection
export async function createApplication(projectId, userId, applicationData) {
    try {
        const docRef = await addDoc(collection(window.db, 'applications'), {
            projectId,
            userId,
            ...applicationData,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating application:', error);
        throw error;
    }
}

export async function getApplications(projectId) {
    try {
        const q = query(
            collection(window.db, 'applications'),
            where('projectId', '==', projectId),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting applications:', error);
        throw error;
    }
}

export async function getUserApplications(userId) {
    try {
        const q = query(
            collection(window.db, 'applications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const applications = await Promise.all(
            querySnapshot.docs.map(async doc => {
                const project = await getProject(doc.data().projectId);
                return {
                    id: doc.id,
                    ...doc.data(),
                    project
                };
            })
        );
        
        return applications;
    } catch (error) {
        console.error('Error getting user applications:', error);
        throw error;
    }
}

export async function getProjectApplications(creatorId) {
    try {
        // First get all projects by this creator
        const projectsQuery = query(
            collection(window.db, 'projects'),
            where('creatorId', '==', creatorId)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectIds = projectsSnapshot.docs.map(doc => doc.id);
        
        // Then get all applications for these projects
        const applications = [];
        for (const projectId of projectIds) {
            const project = await getProject(projectId);
            const applicationsQuery = query(
                collection(window.db, 'applications'),
                where('projectId', '==', projectId),
                orderBy('createdAt', 'desc')
            );
            const applicationsSnapshot = await getDocs(applicationsQuery);
            
            // Get user data for each application
            for (const doc of applicationsSnapshot.docs) {
                const userDoc = await getDoc(doc(window.db, 'users', doc.data().userId));
                applications.push({
                    id: doc.id,
                    ...doc.data(),
                    project,
                    applicant: userDoc.data()
                });
            }
        }
        
        return applications;
    } catch (error) {
        console.error('Error getting project applications:', error);
        throw error;
    }
}

export async function updateApplicationStatus(applicationId, status) {
    try {
        const docRef = doc(window.db, 'applications', applicationId);
        await updateDoc(docRef, { status });
    } catch (error) {
        console.error('Error updating application status:', error);
        throw error;
    }
}

// Notifications Collection
export async function createNotification(userId, notificationData) {
    try {
        const docRef = await addDoc(collection(window.db, `notifications/${userId}/items`), {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

export async function getNotifications(userId) {
    try {
        const q = query(
            collection(window.db, `notifications/${userId}/items`),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
}

export async function markNotificationAsRead(notificationId, userId) {
    try {
        const docRef = doc(window.db, `notifications/${userId}/items`, notificationId);
        await updateDoc(docRef, { read: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
} 