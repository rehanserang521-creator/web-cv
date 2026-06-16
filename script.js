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

// ===== COSMIC BACKGROUND - Galaxy, Constellations, Stars =====
const canvas = document.createElement('canvas');
canvas.id = 'particleCanvas';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];
let mouseX = 0, mouseY = 0;
let time = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = document.documentElement.scrollHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('scroll', () => {
    canvas.height = document.documentElement.scrollHeight;
});

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
});

// ===== STAR CLASS =====
class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.8 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.baseOpacity = Math.random() * 0.8 + 0.15;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.003;
        
        const t = Math.random();
        if (t < 0.4) {
            this.hue = 0; this.sat = 0; this.light = 85 + Math.random() * 15;
        } else if (t < 0.6) {
            this.hue = 200 + Math.random() * 30; this.sat = 15 + Math.random() * 20; this.light = 75 + Math.random() * 15;
        } else if (t < 0.75) {
            this.hue = 250 + Math.random() * 30; this.sat = 25 + Math.random() * 30; this.light = 65 + Math.random() * 20;
        } else if (t < 0.88) {
            this.hue = 170 + Math.random() * 20; this.sat = 20 + Math.random() * 30; this.light = 70 + Math.random() * 15;
        } else {
            this.hue = 30 + Math.random() * 20; this.sat = 40 + Math.random() * 30; this.light = 70 + Math.random() * 15;
        }
    }
    update() {
        this.pulse += this.pulseSpeed;
        const f = Math.sin(this.pulse) * 0.3 + 0.7;
        this.currentOpacity = this.baseOpacity * f;
        this.currentSize = this.size * (Math.sin(this.pulse * 1.3) * 0.12 + 0.88);
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < -5) this.x = canvas.width + 5;
        if (this.x > canvas.width + 5) this.x = -5;
        if (this.y < -5) this.y = canvas.height + 5;
        if (this.y > canvas.height + 5) this.y = -5;
        
        const dx = mouseX - this.x, dy = mouseY - this.y, dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < 200) {
            const force = (200-dist)/200*0.12;
            this.speedX += (dx/dist)*force*0.04;
            this.speedY += (dy/dist)*force*0.04;
            const spd = Math.sqrt(this.speedX*this.speedX+this.speedY*this.speedY);
            if (spd > 1.2) { this.speedX = (this.speedX/spd)*1.2; this.speedY = (this.speedY/spd)*1.2; }
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI*2);
        ctx.fillStyle = `hsla(${this.hue},${this.sat}%,${this.light}%,${this.currentOpacity})`;
        ctx.fill();
        if (this.size > 1.8) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.currentSize*3.5, 0, Math.PI*2);
            ctx.fillStyle = `hsla(${this.hue},${this.sat}%,${this.light}%,${this.currentOpacity*0.06})`;
            ctx.fill();
        }
    }
}

// ===== SHOOTING STAR =====
class ShootingStar {
    constructor() { this.renew(); }
    renew() {
        this.active = false;
        this.x = Math.random()*canvas.width;
        this.y = Math.random()*canvas.height*0.4;
        this.len = Math.random()*100+50;
        this.speed = Math.random()*10+5;
        this.angle = Math.PI/4+(Math.random()-0.5)*0.25;
        this.life = 0;
        this.maxLife = Math.random()*25+15;
        this.opacity = 0;
        this.wait = Math.random()*300+150;
        this.waitCount = 0;
        this.hue = Math.random()<0.3 ? 200+Math.random()*30 : 0;
    }
    update() {
        if (!this.active) {
            this.waitCount++;
            if (this.waitCount>=this.wait) { this.active=true; this.waitCount=0; }
            return;
        }
        this.life++;
        if (this.life>this.maxLife) { this.renew(); return; }
        const p = this.life/this.maxLife;
        this.opacity = p<0.15 ? p/0.15 : 1-(p-0.15)/0.85;
        this.x += Math.cos(this.angle)*this.speed;
        this.y += Math.sin(this.angle)*this.speed;
    }
    draw() {
        if (!this.active||this.opacity<=0) return;
        const ex = this.x-Math.cos(this.angle)*this.len;
        const ey = this.y-Math.sin(this.angle)*this.len;
        const g = ctx.createLinearGradient(this.x,this.y,ex,ey);
        g.addColorStop(0,`hsla(${this.hue},${this.hue?0:60}%,100%,${this.opacity*0.95})`);
        g.addColorStop(0.3,`hsla(${this.hue+20},60%,80%,${this.opacity*0.35})`);
        g.addColorStop(1,`hsla(260,50%,70%,0)`);
        ctx.beginPath(); ctx.moveTo(this.x,this.y); ctx.lineTo(ex,ey);
        ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(this.x,this.y,3.5,0,Math.PI*2);
        ctx.fillStyle=`hsla(0,0%,100%,${this.opacity*0.85})`;
        ctx.fill();
        for (let i=0;i<3;i++) {
            const sx=this.x+(Math.random()-0.5)*10, sy=this.y+(Math.random()-0.5)*10;
            ctx.beginPath(); ctx.arc(sx,sy,Math.random()*1.5+0.5,0,Math.PI*2);
            ctx.fillStyle=`hsla(0,0%,100%,${this.opacity*0.4*Math.random()})`;
            ctx.fill();
        }
    }
}

// ===== NEBULA CLOUDS =====
class Nebula {
    constructor() {
        this.x=Math.random()*canvas.width; this.y=Math.random()*canvas.height;
        this.size=Math.random()*400+200;
        this.speedX=(Math.random()-0.5)*0.08; this.speedY=(Math.random()-0.5)*0.08;
        this.hue=Math.random()<0.4 ? 240+Math.random()*40 : 260+Math.random()*40;
        this.sat=Math.random()*20+30; this.light=Math.random()*8+4;
        this.opacity=Math.random()*0.035+0.015;
        this.pulse=Math.random()*Math.PI*2; this.pulseSpeed=Math.random()*0.005+0.002;
    }
    update() {
        this.x+=this.speedX; this.y+=this.speedY;
        this.pulse+=this.pulseSpeed;
        const f=Math.sin(this.pulse)*0.2+0.8;
        if(this.x<-this.size)this.x=canvas.width+this.size;
        if(this.x>canvas.width+this.size)this.x=-this.size;
        if(this.y<-this.size)this.y=canvas.height+this.size;
        if(this.y>canvas.height+this.size)this.y=-this.size;
        return f;
    }
    draw(pulseFactor) {
        const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size);
        const o=this.opacity*pulseFactor;
        g.addColorStop(0,`hsla(${this.hue},${this.sat}%,${this.light}%,${o})`);
        g.addColorStop(0.4,`hsla(${this.hue+15},${this.sat}%,${this.light}%,${o*0.6})`);
        g.addColorStop(1,`hsla(${this.hue+30},${this.sat}%,${this.light}%,0)`);
        ctx.fillStyle=g;
        ctx.fillRect(this.x-this.size,this.y-this.size,this.size*2,this.size*2);
    }
}

// ===== CONSTELLATIONS =====
const constellationPatterns = [
    [[0,0],[1,-1.2],[2.5,-1],[4,-0.5],[5,0.5],[4.5,1.5],[3.5,2]],
    [[0,0],[0.8,1],[1.8,1.5],[0,-1],[-0.8,-2],[0.8,-0.5],[1.8,-1]],
    [[0,0],[0.7,-1.2],[1.4,0],[2.1,-1.2],[2.8,0]],
    [[0,0],[1,1.5],[2,0],[0,0]],
    [[0,0],[1,-0.5],[2,0],[1.5,1],[1,0.5]],
    [[0,0.5],[0.5,0],[1.2,-0.3],[2,-0.3],[2.8,0],[3.3,0.5],[3,1.2]]
];

class Constellation {
    constructor() {
        this.x=Math.random()*(canvas.width-200)+100;
        this.y=Math.random()*(canvas.height-200)+100;
        this.scale=Math.random()*50+30;
        this.rotation=Math.random()*Math.PI*2;
        this.pattern=constellationPatterns[Math.floor(Math.random()*constellationPatterns.length)];
        this.opacity=Math.random()*0.12+0.04;
        this.pulse=Math.random()*Math.PI*2;
        this.pulseSpeed=Math.random()*0.003+0.001;
        this.starSize=Math.random()*1.2+0.5;
    }
    update() { this.pulse+=this.pulseSpeed; }
    draw() {
        const f=Math.sin(this.pulse)*0.2+0.8;
        const o=this.opacity*f;
        const points=this.pattern.map(p=>({
            x:this.x+Math.cos(this.rotation)*p[0]*this.scale-Math.sin(this.rotation)*p[1]*this.scale,
            y:this.y+Math.sin(this.rotation)*p[0]*this.scale+Math.cos(this.rotation)*p[1]*this.scale
        }));
        ctx.beginPath(); ctx.moveTo(points[0].x,points[0].y);
        for(let i=1;i<points.length;i++) ctx.lineTo(points[i].x,points[i].y);
        ctx.strokeStyle=`hsla(260,30%,70%,${o*0.5})`; ctx.lineWidth=0.8; ctx.stroke();
        points.forEach((p,i)=>{
            const s=this.starSize*(i===0||i===points.length-1?1.5:1);
            ctx.beginPath(); ctx.arc(p.x,p.y,s,0,Math.PI*2);
            ctx.fillStyle=`hsla(0,0%,90%,${o*0.7})`; ctx.fill();
            ctx.beginPath(); ctx.arc(p.x,p.y,s*2.5,0,Math.PI*2);
            ctx.fillStyle=`hsla(260,30%,70%,${o*0.1})`; ctx.fill();
        });
    }
}

// ===== INITIALIZE UNIVERSE =====
const starCount=Math.min(Math.floor((canvas.width*canvas.height)/5000),250);
for(let i=0;i<starCount;i++) stars.push(new Star());
const nebulae=[]; for(let i=0;i<5;i++) nebulae.push(new Nebula());
const constellations=[]; const conCount=Math.floor(Math.random()*3)+3;
for(let i=0;i<conCount;i++) constellations.push(new Constellation());
for(let i=0;i<3;i++) shootingStars.push(new ShootingStar());
shootingStars.forEach((s,i)=>{s.wait=i*200+Math.random()*150;});

// ===== ANIMATION LOOP =====
function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const bgGrad=ctx.createRadialGradient(canvas.width*0.5,canvas.height*0.3,0,canvas.width*0.5,canvas.height*0.3,canvas.width*0.8);
    bgGrad.addColorStop(0,'#0a0620'); bgGrad.addColorStop(0.3,'#070518'); bgGrad.addColorStop(0.6,'#050412'); bgGrad.addColorStop(1,'#030208');
    ctx.fillStyle=bgGrad; ctx.fillRect(0,0,canvas.width,canvas.height);
    nebulae.forEach(n=>{const f=n.update();n.draw(f);});
    constellations.forEach(c=>{c.update();c.draw();});
    stars.forEach(s=>{s.update();s.draw();});
    shootingStars.forEach(s=>{s.update();s.draw();});
    requestAnimationFrame(animate);
}
animate();

// ===== Intersection Observer for fade-in =====
const observerOptions={threshold:0.15,rootMargin:'0px 0px -50px 0px'};
const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});
},observerOptions);
document.querySelectorAll('.section').forEach(section=>{section.classList.add('fade-section');observer.observe(section);});

// ===== GALLERY - Lightbox =====
const galleryGrid = document.getElementById('galleryGrid');

// Example gallery images (Canva design placeholders)
const galleryImages = [
    {
        src: 'https://placehold.co/400x300/6366f1/ffffff?text=Logo+Design+1',
        alt: 'Logo Design 1 - Canva'
    },
    {
        src: 'https://placehold.co/400x300/a78bfa/ffffff?text=Banner+Design+1',
        alt: 'Banner Design 1 - Canva'
    },
    {
        src: 'https://placehold.co/400x300/8b5cf6/ffffff?text=Logo+Design+2',
        alt: 'Logo Design 2 - Canva'
    },
    {
        src: 'https://placehold.co/400x300/7c3aed/ffffff?text=Banner+Design+2',
        alt: 'Banner Design 2 - Canva'
    }
];

// Render gallery
galleryImages.forEach(img => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy">`;
    item.addEventListener('click', () => openLightbox(img.src, img.alt));
    galleryGrid.appendChild(item);
});

// Lightbox
const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img class="lightbox-img" src="" alt="">
`;
document.body.appendChild(lightbox);

function openLightbox(src, alt) {
    lightbox.querySelector('.lightbox-img').src = src;
    lightbox.querySelector('.lightbox-img').alt = alt;
    lightbox.classList.add('active');
}

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        lightbox.classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('active');
});