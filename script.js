// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Close nav on link click (mobile)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ===== Smooth scroll offset for fixed navbar =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

// ===== Dark Fantasy Particle Background =====
const canvas = document.createElement('canvas');
canvas.id = 'particleCanvas';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Update canvas height on scroll (so particles cover full page)
window.addEventListener('scroll', () => {
    canvas.height = document.documentElement.scrollHeight;
});

// Mouse tracking for interactive particles
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1.2;
        this.speedY = (Math.random() - 0.5) * 1.2;
        this.opacity = Math.random() * 0.6 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        // Red-dark hues: hsl 0-10, low saturation, dark
        this.hue = Math.random() * 15 + 345; // 345-360 + 0-15 (deep reds)
        this.sat = Math.random() * 30 + 10;  // 10-40%
        this.light = Math.random() * 15 + 10; // 10-25%
        this.connections = [];
    }

    update() {
        this.pulse += this.pulseSpeed;
        const pulseFactor = Math.sin(this.pulse) * 0.3 + 0.7;
        this.currentSize = this.size * pulseFactor;
        this.currentOpacity = this.opacity * (Math.sin(this.pulse * 1.5) * 0.3 + 0.7);

        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;

        // Mouse interaction - slight attraction/repulsion
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
            const force = (200 - dist) / 200 * 0.2;
            this.speedX += dx / dist * force * 0.1;
            this.speedY += dy / dist * force * 0.1;
            // Limit speed
            const maxSpeed = 2.5;
            const spd = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (spd > maxSpeed) {
                this.speedX = (this.speedX / spd) * maxSpeed;
                this.speedY = (this.speedY / spd) * maxSpeed;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.currentOpacity})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.currentOpacity * 0.15})`;
        ctx.fill();
    }
}

// Create particles based on screen area
const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 150);

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function drawConnections() {
    // Draw lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 120;
            if (dist < maxDist) {
                const opacity = (1 - dist / maxDist) * 0.25;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `hsla(0, 30%, 30%, ${opacity})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    drawConnections();
    requestAnimationFrame(animateParticles);
}

animateParticles();

// ===== Text Glitch Effect on Hover =====
document.querySelectorAll('.glitch-text').forEach(el => {
    el.addEventListener('mouseenter', () => {
        el.classList.add('glitching');
    });
    el.addEventListener('mouseleave', () => {
        el.classList.remove('glitching');
    });
});

// ===== Intersection Observer for fade-in sections =====
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    section.classList.add('fade-section');
    observer.observe(section);
});