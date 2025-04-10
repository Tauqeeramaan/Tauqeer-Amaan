document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCE2UKIQv9vxIT6pB5NFEImo6Cp4lJ6PyE",
        authDomain: "my-portfolio-4a287.firebaseapp.com",
        projectId: "my-portfolio-4a287",
        storageBucket: "my-portfolio-4a287.appspot.com",
        messagingSenderId: "813926620943",
        appId: "1:813926620943:web:52b2f1c433cc38ea14e87a",
        measurementId: "G-HG3MJFVMBH"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    // Initialize particles.js
    particlesJS.load('particles-js', 'particles.json', function() {
        console.log('Particles.js loaded');
    });

    // Scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    document.querySelectorAll('.hidden').forEach(el => {
        observer.observe(el);
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        themeToggle.textContent = document.body.classList.contains('light-mode') ? '🌙' : '🌓';
    });

    // Education button toggle
    const educationBtn = document.getElementById('educationBtn');
    const subButtons = document.getElementById('subButtons');
    
    educationBtn.addEventListener('click', function() {
        if (subButtons.style.display === 'flex') {
            subButtons.style.display = 'none';
            this.textContent = 'EDUCATION';
        } else {
            subButtons.style.display = 'flex';
            this.textContent = '▼ EDUCATION ▼';
        }
    });

    // Resume download tracking
    document.getElementById('resumeDownload').addEventListener('click', async function(e) {
        try {
            await db.collection("downloadStats").doc("resume").set({
                count: firebase.firestore.FieldValue.increment(1),
                lastDownload: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Download tracking error:", error);
        }
    });

    // Admin panel functions
    async function showAdminPanel() {
        const panel = document.getElementById('adminView');
        
        try {
            const [visitorSnap, downloadSnap] = await Promise.all([
                db.collection("visitorStats").doc("counter").get(),
                db.collection("downloadStats").doc("resume").get()
            ]);

            panel.innerHTML = `
                <h3>Admin Dashboard</h3>
                <p><strong>Total Visitors:</strong> ${visitorSnap.exists ? visitorSnap.data().total : 0}</p>
                <p><strong>Resume Downloads:</strong> ${downloadSnap.exists ? downloadSnap.data().count : 0}</p>
                <p><strong>Last Download:</strong> ${downloadSnap.exists ? new Date(downloadSnap.data().lastDownload.seconds * 1000).toLocaleString() : 'Never'}</p>
                <button id="logoutBtn">Close</button>
            `;

            panel.style.display = 'block';
            
            document.getElementById('logoutBtn').addEventListener('click', function() {
                auth.signOut();
                panel.style.display = 'none';
            });

        } catch (error) {
            panel.innerHTML = `<div style="color:red;">Error loading stats: ${error.message}</div>`;
        }
    }

    async function handleAdminLogin() {
        const email = prompt("Enter admin email:");
        if (!email) return;
        
        const password = prompt("Enter password:");
        if (!password) return;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            await showAdminPanel();
        } catch (error) {
            alert(`Login failed: ${error.message}`);
        }
    }

    // Check for admin access
    if (window.location.hash === "#admin") {
        handleAdminLogin();
    }

    // Visitor counter
    async function updateCounter() {
        let count = parseInt(localStorage.getItem('visitorCount')) || 0;
        count++;
        localStorage.setItem('visitorCount', count);
        
        if (count % 10 === 0) {
            try {
                await db.collection("visitorStats").doc("counter").set({
                    total: firebase.firestore.FieldValue.increment(10),
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error updating visitor count:", error);
            }
        }
    }

    updateCounter();

    // Typing animation
    const phrases = ["Full Stack Developer", "Web Designer", "Tech Enthusiast"];
    let currentPhrase = 0;
    let charIndex = 0;
    const typingElement = document.querySelector('h1 span');

    function type() {
        if (charIndex < phrases[currentPhrase].length) {
            typingElement.textContent += phrases[currentPhrase].charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        } else {
            setTimeout(erase, 2000);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typingElement.textContent = phrases[currentPhrase].substring(0, charIndex-1);
            charIndex--;
            setTimeout(erase, 50);
        } else {
            currentPhrase = (currentPhrase+1) % phrases.length;
            setTimeout(type, 500);
        }
    }

    // Start typing animation after 1 second
    setTimeout(() => {
        if(phrases.length && typingElement) {
            typingElement.textContent = '';
            type();
        }
    }, 1000);
});