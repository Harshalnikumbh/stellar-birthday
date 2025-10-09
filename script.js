// Application State
const appState = {
    currentPage: 'landing',
    visitedPlanets: new Set(),
    totalPlanets: 4,
    isTransitioning: false
};

// Planet Messages Data
const planetMessages = {
    jupiter: "Like Jupiter's storms, our friendship has weathered time—wild yet unbroken, carrying us forward through every season.",
    saturn: "Saturn's rings remind me of the circles of years we've shared, each one etched with laughter, quarrels, and unshakable trust.",
    mars: "Beneath Mars' dust is silence, like the quiet understanding that binds us when words are not needed.",
    neptune: "Neptune drifts in mystery, as vast and endless as the memories we carry from childhood."
};

// DOM Elements
const pages = {
    landing: document.getElementById('landing-page'),
    planets: document.getElementById('planets-page'),
    letter: document.getElementById('letter-page')
};

const saturnEntry = document.getElementById('saturn-entry');
const planetItems = document.querySelectorAll('.planet-item');
const modal = document.getElementById('planet-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalPlanetName = document.getElementById('modal-planet-name');
const modalMessage = document.getElementById('modal-message');
const progressText = document.getElementById('progress-text');
const progressDots = document.querySelectorAll('.dot');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    createFloatingStars();
    
    // Start with landing page
    showPage('landing');
});

// Event Listeners Setup
function setupEventListeners() {
    // Saturn planet click to enter planets page
    saturnEntry.addEventListener('click', function() {
        if (!appState.isTransitioning) {
            transitionToPage('planets');
        }
    });
    
    // Planet clicks in planets page
    planetItems.forEach(planet => {
        planet.addEventListener('click', function() {
            const planetName = this.dataset.planet;
            showPlanetMessage(planetName);
        });
    });
    
    // Modal close events
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Prevent context menu on planets (better mobile experience)
    planetItems.forEach(planet => {
        planet.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    });
}

// Page Transition Management
function showPage(pageId) {
    if (appState.isTransitioning) return;
    
    appState.isTransitioning = true;
    
    // Hide all pages
    Object.values(pages).forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page after a brief delay
    setTimeout(() => {
        pages[pageId].classList.add('active');
        appState.currentPage = pageId;
        
        // Initialize page-specific features
        if (pageId === 'letter') {
            initializeStardustAnimation();
        }
        
        appState.isTransitioning = false;
    }, 100);
}

function transitionToPage(pageId) {
    showPage(pageId);
}

// Planet Messages Modal
function showPlanetMessage(planetName) {
    const message = planetMessages[planetName];
    
    modalPlanetName.textContent = capitalizeFirst(planetName);
    modalMessage.textContent = message;
    
    modal.classList.add('active');
    
    // Mark planet as visited
    if (!appState.visitedPlanets.has(planetName)) {
        markPlanetVisited(planetName);
    }
}

function closeModal() {
    modal.classList.remove('active');
    
    // Check if all planets have been visited
    setTimeout(() => {
        if (appState.visitedPlanets.size === appState.totalPlanets) {
            transitionToFinalLetter();
        }
    }, 300);
}

function markPlanetVisited(planetName) {
    appState.visitedPlanets.add(planetName);
    
    // Update UI
    const planetElement = document.querySelector(`[data-planet="${planetName}"]`);
    if (planetElement) {
        planetElement.classList.add('visited');
    }
    
    // Update progress dots
    const progressDot = document.querySelector(`.dot[data-planet="${planetName}"]`);
    if (progressDot) {
        progressDot.classList.add('completed');
    }
    
    // Update progress text
    updateProgressText();
}

function updateProgressText() {
    const remaining = appState.totalPlanets - appState.visitedPlanets.size;
    
    if (remaining === 0) {
        progressText.textContent = 'All memories unlocked! Preparing your letter...';
    } else if (remaining === 1) {
        progressText.textContent = '1 more planet to explore...';
    } else {
        progressText.textContent = `${remaining} more planets to explore...`;
    }
}

function transitionToFinalLetter() {
    setTimeout(() => {
        transitionToPage('letter');
    }, 500);
}

// Stardust Canvas Animation
function initializeStardustAnimation() {
    const canvas = document.getElementById('stardust-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle system
    const particles = [];
    const maxParticles = 100;
    
    class Particle {
        constructor() {
            this.reset();
            this.life = Math.random() * 100; // Start with random life to spread initial particles
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.life = 100;
            this.decay = Math.random() * 2 + 0.5;
            this.size = Math.random() * 3 + 1;
            this.color = this.getRandomColor();
        }
        
        getRandomColor() {
            const colors = [
                'rgba(255, 235, 59, ',
                'rgba(255, 152, 0, ',
                'rgba(233, 30, 99, ',
                'rgba(156, 39, 176, ',
                'rgba(63, 81, 181, ',
                'rgba(0, 188, 212, ',
                'rgba(255, 255, 255, '
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= this.decay;
            
            // Add some gravity and swirl
            this.vy += 0.02;
            this.vx += Math.sin(this.y * 0.01) * 0.02;
            
            if (this.life <= 0 || this.y > canvas.height + 10) {
                this.reset();
                this.y = -10; // Start from top when respawning
            }
        }
        
        draw() {
            const alpha = Math.max(0, this.life / 100);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color + alpha + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add sparkle effect
            if (Math.random() < 0.1) {
                ctx.fillStyle = 'rgba(255, 255, 255, ' + (alpha * 0.8) + ')';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    // Initialize particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Floating Stars Enhancement
function createFloatingStars() {
    const starsContainers = document.querySelectorAll('.floating-particles');
    
    starsContainers.forEach(container => {
        // Create additional floating stars
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            star.className = 'floating-star';
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite alternate;
                animation-delay: ${Math.random() * 2}s;
            `;
            container.appendChild(star);
        }
    });
}

// Utility Functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Enhanced hover effects for planets
planetItems.forEach(planet => {
    planet.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.2) translateY(-10px)';
        this.style.filter = 'brightness(1.3)';
    });
    
    planet.addEventListener('mouseleave', function() {
        if (!this.classList.contains('visited')) {
            this.style.transform = '';
            this.style.filter = '';
        }
    });
});

// Touch events for mobile
planetItems.forEach(planet => {
    let touchStartTime;
    
    planet.addEventListener('touchstart', function(e) {
        touchStartTime = Date.now();
        this.style.transform = 'scale(1.1) translateY(-5px)';
    });
    
    planet.addEventListener('touchend', function(e) {
        e.preventDefault();
        const touchDuration = Date.now() - touchStartTime;
        
        // Reset transform
        setTimeout(() => {
            if (!this.classList.contains('visited')) {
                this.style.transform = '';
            }
        }, 150);
        
        // Trigger click if it was a short touch
        if (touchDuration < 500) {
            const planetName = this.dataset.planet;
            showPlanetMessage(planetName);
        }
    });
});

// Performance optimization: Pause animations when page is not visible
document.addEventListener('visibilitychange', function() {
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
        if (document.hidden) {
            el.style.animationPlayState = 'paused';
        } else {
            el.style.animationPlayState = 'running';
        }
    });
});

// Preload planet images for better performance
function preloadImages() {
    const imageUrls = [
        'https://upload.wikimedia.org/wikipedia/commons/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize image preloading
preloadImages();

// Add some extra cosmic effects on page load
window.addEventListener('load', function() {
    // Add shooting star effect occasionally
    setInterval(createShootingStar, 8000 + Math.random() * 7000);
});

function createShootingStar() {
    if (appState.currentPage === 'landing') {
        const shootingStar = document.createElement('div');
        shootingStar.style.cssText = `
            position: absolute;
            top: ${Math.random() * 30}%;
            right: -10px;
            width: 2px;
            height: 2px;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.8), transparent);
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
            animation: shooting-star 2s linear forwards;
            z-index: 10;
        `;
        
        // Add shooting star CSS if not already present
        if (!document.querySelector('#shooting-star-style')) {
            const style = document.createElement('style');
            style.id = 'shooting-star-style';
            style.textContent = `
                @keyframes shooting-star {
                    0% { 
                        transform: translateX(0) translateY(0) scale(0);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    90% {
                        opacity: 1;
                    }
                    100% { 
                        transform: translateX(-100vw) translateY(50vh) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        pages.landing.appendChild(shootingStar);
        
        // Remove the shooting star after animation
        setTimeout(() => {
            if (shootingStar.parentNode) {
                shootingStar.parentNode.removeChild(shootingStar);
            }
        }, 2000);
    }
}
