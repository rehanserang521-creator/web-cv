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

// ===== Cosmic Starfield Particle Background =====
const canvas = document.createElement('canvas');
canvas.id = 'particleCanvas';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let particles = [];
let shootingStars = [];
let mouseX = 0;
let mouseY = 0;
let nebulaTime = 0;

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

class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.baseOpacity = Math.random() * 0.7 + 0.2;
        this.opacity = this.baseOpacity;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.015 + 0.003;
        
        // Star colors: white, pale blue, pale purple, pale teal
        const colorType = Math.random();
        if (colorType < 0.5) {
            // White star
            this.hue = 0;
            this.sat = 0;
            this.light = Math.random() * 20 + 80; // 80-100%
        } else if (colorType < 0.7) {
            // Blue-white star
            this.hue = Math.random() * 20 + 200; // 200-220
            this.sat = Math.random() * 20 + 10;  // 10-30%
            this.light = Math.random() * 15 + 75; // 75-90%
        } else if (colorType < 0.85) {
            // Purple star
            this.hue = Math.random() * 20 + 260; // 260-280
            this.sat = Math.random() * 30 + 20;  // 20-50%
            this.light = Math.random() * 15 + 70; // 70-85%
        } else {
            // Teal/cyan star
            this.hue = Math.random() * 20 + 170; // 170-190
            this.sat = Math.random() * 30 + 20;  // 20-50%
            this.light = Math.random() * 15 + 70; // 70-85%
        }
    }

    update() {
        this.pulse += this.pulseSpeed;
        const pulseFactor = Math.sin(this.pulse) * 0.3 + 0.7;
        this.currentOpacity = this.opacity * pulseFactor;
        this.currentSize = this.size * (Math.sin(this.pulse * 1.2) * 0.15 + 0.85);

        // Very slow drift
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if (this.x < -5) this.x = canvas.width + 5;
        if (this.x > canvas.width + 5) this.x = -5;
        if (this.y < -5) this.y = canvas.height + 5;
        if (this.y > canvas.height + 5) this.y = -5;

        // Mouse interaction - gentle attraction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
            const force = (180 - dist) / 180 * 0.15;
            this.speedX += (dx / dist) * force * 0.05;
            this.speedY += (dy / dist) * force * 0.05;
            // Speed limit
            const spd = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (spd > 1.5) {
                this.speedX = (this.speedX / spd) * 1.5;
                this.speedY = (this.speedY / spd) * 1.5;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.currentOpacity})`;
        ctx.fill();

        // Glow for brighter stars
        if (this.size > 1.5) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize * 3, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.currentOpacity * 0.08})`;
            ctx.fill();
        }
    }
}

class ShootingStar {
    constructor() {
        this.renew();
    }

    renew() {
        this.active = false;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 4;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
        this.life = 0;
        this.maxLife = Math.random() * 30 + 20;
        this.opacity = 0;
        this.wait = Math.random() * 200 + 100; // frames to wait before starting
        this.waitCount = 0;
    }

    update() {
        if (!this.active) {
            this.waitCount++;
            if (this.waitCount >= this.wait) {
                this.active = true;
                this.waitCount = 0;
            }
            return;
        }

        this.life++;
        if (this.life > this.maxLife) {
            this.renew();
            return;
        }

        const progress = this.life / this.maxLife;
        // Fade in then out
        if (progress < 0.2) {
            this.opacity = progress / 0.2;
        } else {
            this.opacity = 1 - (progress - 0.2) / 0.8;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw() {
        if (!this.active || this.opacity <= 0) return;

        const endX = this.x - Math.cos(this.angle) * this.length;
        const endY = this.y - Math.sin(this.angle) * this.length;

        // Trail gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, endX, endY);
        gradient.addColorStop(0, `hsla(0, 0%, 100%, ${this.opacity * 0.9})`);
        gradient.addColorStop(0.3, `hsla(220, 60%, 80%, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, `hsla(260, 50%, 70%, 0)`);

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(0, 0%, 100%, ${this.opacity * 0.8})`;
        ctx.fill();
    }
}

// Nebula clouds - slow-moving colored patches
class Nebula {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 300 + 150;
        this.speedX = (Math.random() - 0.5) * 0.15;
        this.speedY = (Math.random() - 0.5) * 0.15;
        this.hue = Math.random() < 0.5 ? 
            Math.random() * 40 + 240 : // blue-purple 240-280
            Math.random() * 40 + 260;  // purple-violet 260-300
        this.sat = Math.random() * 20 + 30;
        this.light = Math.random() * 10 + 5;
        this.opacity = Math.random() * 0.04 + 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.opacity})`);
        gradient.addColorStop(0.5, `hsla(${this.hue + 20}, ${this.sat}%, ${this.light}%, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${this.hue}, ${this.sat}%, ${this.light}%, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            this.x - this.size,
            this.y - this.size,
            this.size * 2,
            this.size * 2
        );
    }
}

// Create universe elements
const starCount = Math.min(Math.floor((canvas.width * canvas.height) / 6000), 200);
const nebulaCount = 5;
const shootingStarCount = 3;

for (let i = 0; i < starCount; i++) {
    particles.push(new Star());
}

const nebulae = [];
for (let i = 0; i < nebulaCount; i++) {
    nebulae.push(new Nebula());
}

for (let i = 0; i < shootingStarCount; i++) {
    shootingStars.push(new ShootingStar());
    // Stagger initial wait times
    shootingStars[i].wait = i * 150 + Math.random() * 100;
}

function drawConstellations() {
    // Draw faint lines between nearby stars (constellation-like)
    for (let i = 0; i < particles.length; i += 3) { // only check every 3rd star for performance
        for (let j = i + 1; j < particles.length; j += 2) {
            if (particles[i].size < 1.2 || particles[j].size < 1.2) continue;
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 80;
            if (dist < maxDist) {
                const opacity = (1 - dist / maxDist) * 0.06;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `hsla(260, 30%, 70%, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw deep space gradient
    const spaceGrad = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 0,
        canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.7
    );
    spaceGrad.addColorStop(0, '#080518');
    spaceGrad.addColorStop(0.5, '#060412');
    spaceGrad.addColorStop(1, '#030207');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw nebulae
    nebulae.forEach(n => {
        n.update();
        n.draw();
    });

    // Draw constellation lines
    drawConstellations();

    // Draw stars
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw shooting stars
    shootingStars.forEach(s => {
        s.update();
        s.draw();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

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