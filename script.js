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

// ===== COSMIC BACKGROUND - Black Hole, Galaxy, Constellations, Stars =====
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
        this.hue = Math.random()<0.3 ? 200+Math.random()*30 : 0; // blue or white
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
        // Sparkles
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

// ===== GALAXY (Spiral) =====
class Galaxy {
    constructor() {
        this.x=Math.random()*canvas.width;
        this.y=Math.random()*canvas.height*0.5+canvas.height*0.2;
        this.size=Math.random()*180+120;
        this.arms=Math.floor(Math.random()*2)+3; // 3 or 4 arms
        this.twist=Math.random()*2+2;
        this.hue=Math.random()<0.5 ? 200+Math.random()*40 : 250+Math.random()*40;
        this.sat=Math.random()*15+25;
        this.light=Math.random()*8+6;
        this.opacity=Math.random()*0.12+0.06;
        this.rotation=Math.random()*Math.PI*2;
        this.rotationSpeed=(Math.random()-0.5)*0.001;
        this.stars=[];
        // Generate galaxy stars
        const starCount=Math.floor(Math.random()*300)+200;
        for(let i=0;i<starCount;i++) {
            const angle=Math.random()*Math.PI*2;
            const radius=Math.random()*this.size;
            const armOffset=radius/this.size*this.twist;
            const armAngle=angle+armOffset+Math.floor(Math.random()*this.arms)*(Math.PI*2/this.arms);
            const scatter=(Math.random()-0.5)*(radius*0.3+5);
            this.stars.push({
                ra:armAngle+scatter/radius,
                rr:radius+(Math.random()-0.5)*8,
                size:Math.random()*1.5+0.3,
                hue:this.hue+(Math.random()-0.5)*30,
                sat:this.sat+Math.random()*20,
                light:Math.random()*20+60,
                opacity:Math.random()*0.6+0.2
            });
        }
    }
    update() {
        this.rotation+=this.rotationSpeed;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation);
        
        // Core glow
        const coreG=ctx.createRadialGradient(0,0,0,0,0,this.size*0.15);
        coreG.addColorStop(0,`hsla(${this.hue},${this.sat+10}%,${this.light+15}%,${this.opacity*1.5})`);
        coreG.addColorStop(1,`hsla(${this.hue},${this.sat}%,${this.light}%,0)`);
        ctx.fillStyle=coreG;
        ctx.beginPath(); ctx.arc(0,0,this.size*0.15,0,Math.PI*2); ctx.fill();
        
        // Galaxy stars
        this.stars.forEach(s=>{
            const x=Math.cos(s.ra)*s.rr, y=Math.sin(s.ra)*s.rr;
            ctx.beginPath();
            ctx.arc(x,y,s.size,0,Math.PI*2);
            ctx.fillStyle=`hsla(${s.hue},${s.sat}%,${s.light}%,${s.opacity*this.opacity*3})`;
            ctx.fill();
        });
        
        ctx.restore();
    }
}

// ===== BLACK HOLE =====
class BlackHole {
    constructor() {
        this.x=Math.random()*canvas.width;
        this.y=Math.random()*canvas.height*0.4+canvas.height*0.3;
        this.radius=Math.random()*40+25;
        this.opacity=Math.random()*0.5+0.3;
        this.pulse=Math.random()*Math.PI*2;
        this.pulseSpeed=Math.random()*0.008+0.004;
        this.accretionDisk=[];
        this.ringAngle=0;
        
        // Accretion disk particles
        const count=Math.floor(Math.random()*100)+80;
        for(let i=0;i<count;i++) {
            const angle=Math.random()*Math.PI*2;
            const dist=this.radius+Math.random()*this.radius*1.2;
            this.accretionDisk.push({
                angle:angle,
                dist:dist,
                size:Math.random()*2+0.5,
                speed:0.02+Math.random()*0.03,
                hue:this.radius>35?200+Math.random()*40:250+Math.random()*40,
                sat:Math.random()*30+40,
                light:Math.random()*20+40,
                opacity:Math.random()*0.4+0.1
            });
        }
    }
    update() {
        this.pulse+=this.pulseSpeed;
        this.ringAngle+=0.005;
        this.accretionDisk.forEach(p=>{
            p.angle+=p.speed;
        });
    }
    draw() {
        const pulse=Math.sin(this.pulse)*0.1+0.9;
        const radius=this.radius*pulse;
        
        // Gravitational lensing rings
        for(let i=3;i>=0;i--) {
            const ringR=radius+i*radius*0.15;
            ctx.beginPath();
            ctx.arc(this.x,this.y,ringR,0,Math.PI*2);
            ctx.strokeStyle=`hsla(260,30%,40%,${this.opacity*0.08*(1-i/4)})`;
            ctx.lineWidth=2;
            ctx.stroke();
        }
        
        // Event horizon (black circle)
        const horizonG=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,radius);
        horizonG.addColorStop(0,`hsla(0,0%,0%,0.95)`);
        horizonG.addColorStop(0.7,`hsla(260,20%,8%,0.9)`);
        horizonG.addColorStop(0.9,`hsla(280,30%,15%,0.6)`);
        horizonG.addColorStop(1,`hsla(280,30%,20%,0.3)`);
        ctx.beginPath(); ctx.arc(this.x,this.y,radius,0,Math.PI*2);
        ctx.fillStyle=horizonG; ctx.fill();
        
        // Accretion disk (glowing ring around black hole)
        this.accretionDisk.forEach(p=>{
            const x=this.x+Math.cos(p.angle)*p.dist;
            const y=this.y+Math.sin(p.angle)*p.dist*0.5; // flatten
            ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2);
            ctx.fillStyle=`hsla(${p.hue},${p.sat}%,${p.light}%,${p.opacity*this.opacity})`;
            ctx.fill();
        });
        
        // Blue/red shift glow on edges
        const glowG=ctx.createRadialGradient(
            this.x-radius*0.5,this.y,0,
            this.x,this.y,radius*1.8
        );
        glowG.addColorStop(0,`hsla(260,40%,40%,0)`);
        glowG.addColorStop(0.3,`hsla(260,40%,50%,0)`);
        glowG.addColorStop(0.5,`hsla(220,50%,60%,${this.opacity*0.06})`);
        glowG.addColorStop(0.7,`hsla(250,40%,50%,${this.opacity*0.04})`);
        glowG.addColorStop(1,`hsla(260,30%,30%,0)`);
        ctx.fillStyle=glowG;
        ctx.beginPath(); ctx.arc(this.x,this.y,radius*1.8,0,Math.PI*2);
        ctx.fill();
        
        // Photon ring (bright inner ring)
        ctx.beginPath();
        ctx.arc(this.x,this.y,radius*0.9,0,Math.PI*2);
        ctx.strokeStyle=`hsla(40,60%,70%,${this.opacity*0.15*pulse})`;
        ctx.lineWidth=1.5;
        ctx.stroke();
        
        // Jet streams (relativistic jets)
        const jetAngle=-Math.PI/4+Math.sin(this.pulse*0.5)*0.2;
        for(let side=-1;side<=1;side+=2) {
            const jx=this.x+Math.cos(jetAngle+Math.PI/2*side)*radius*0.3;
            const jy=this.y+Math.sin(jetAngle+Math.PI/2*side)*radius*0.3;
            const jLen=radius*2.5;
            const jg=ctx.createLinearGradient(jx,jy,jx+Math.cos(jetAngle)*jLen,jy+Math.sin(jetAngle)*jLen);
            jg.addColorStop(0,`hsla(260,40%,50%,${this.opacity*0.08})`);
            jg.addColorStop(0.5,`hsla(220,50%,60%,${this.opacity*0.03})`);
            jg.addColorStop(1,`hsla(200,40%,50%,0)`);
            ctx.beginPath();
            ctx.moveTo(jx,jy);
            ctx.lineTo(jx+Math.cos(jetAngle)*jLen,jy+Math.sin(jetAngle)*jLen);
            ctx.strokeStyle=jg;
            ctx.lineWidth=3;
            ctx.stroke();
        }
    }
}

// ===== CONSTELLATIONS =====
const constellationPatterns = [
    // Big Dipper-like
    [[0,0],[1,-1.2],[2.5,-1],[4,-0.5],[5,0.5],[4.5,1.5],[3.5,2]],
    // Cross-like
    [[0,0],[0.8,1],[1.8,1.5],[0,-1],[-0.8,-2],[0.8,-0.5],[1.8,-1]],
    // W-like (Cassiopeia)
    [[0,0],[0.7,-1.2],[1.4,0],[2.1,-1.2],[2.8,0]],
    // Triangle
    [[0,0],[1,1.5],[2,0],[0,0]],
    // Arrow
    [[0,0],[1,-0.5],[2,0],[1.5,1],[1,0.5]],
    // Crown-like arc
    [[0,0.5],[0.5,0],[1.2,-0.3],[2,-0.3],[2.8,0],[3.3,0.5],[3,1.2]]
];

class Constellation {
    constructor() {
        // Place in a random area
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
    update() {
        this.pulse+=this.pulseSpeed;
    }
    draw() {
        const f=Math.sin(this.pulse)*0.2+0.8;
        const o=this.opacity*f;
        
        // Draw star positions
        const points=this.pattern.map(p=>({
            x:this.x+Math.cos(this.rotation)*p[0]*this.scale-Math.sin(this.rotation)*p[1]*this.scale,
            y:this.y+Math.sin(this.rotation)*p[0]*this.scale+Math.cos(this.rotation)*p[1]*this.scale
        }));
        
        // Draw lines
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        for(let i=1;i<points.length;i++) {
            ctx.lineTo(points[i].x,points[i].y);
        }
        ctx.strokeStyle=`hsla(260,30%,70%,${o*0.5})`;
        ctx.lineWidth=0.8;
        ctx.stroke();
        
        // Draw stars at vertices
        points.forEach((p,i)=>{
            const s=this.starSize*(i===0||i===points.length-1?1.5:1);
            ctx.beginPath(); ctx.arc(p.x,p.y,s,0,Math.PI*2);
            ctx.fillStyle=`hsla(0,0%,90%,${o*0.7})`;
            ctx.fill();
            // Glow
            ctx.beginPath(); ctx.arc(p.x,p.y,s*2.5,0,Math.PI*2);
            ctx.fillStyle=`hsla(260,30%,70%,${o*0.1})`;
            ctx.fill();
        });
    }
}

// ===== INITIALIZE UNIVERSE =====
const starCount=Math.min(Math.floor((canvas.width*canvas.height)/5000),250);
for(let i=0;i<starCount;i++) stars.push(new Star());

const nebulae=[];
for(let i=0;i<5;i++) nebulae.push(new Nebula());

const galaxies=[];
const galaxyCount=Math.floor(Math.random()*2)+1; // 1-2 galaxies
for(let i=0;i<galaxyCount;i++) galaxies.push(new Galaxy());

const constellations=[];
const conCount=Math.floor(Math.random()*3)+3; // 3-5 constellations
for(let i=0;i<conCount;i++) constellations.push(new Constellation());

for(let i=0;i<3;i++) shootingStars.push(new ShootingStar());
shootingStars.forEach((s,i)=>{s.wait=i*200+Math.random()*150;});

// ===== ANIMATION LOOP =====
function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    // Deep space gradient background
    const bgGrad=ctx.createRadialGradient(
        canvas.width*0.5,canvas.height*0.3,0,
        canvas.width*0.5,canvas.height*0.3,canvas.width*0.8
    );
    bgGrad.addColorStop(0,'#0a0620');
    bgGrad.addColorStop(0.3,'#070518');
    bgGrad.addColorStop(0.6,'#050412');
    bgGrad.addColorStop(1,'#030208');
    ctx.fillStyle=bgGrad;
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    // Nebulae (deepest layer)
    nebulae.forEach(n=>{
        const f=n.update();
        n.draw(f);
    });
    
    // Galaxies
    galaxies.forEach(g=>{
        g.update();
        g.draw();
    });
    
    // Constellations
    constellations.forEach(c=>{
        c.update();
        c.draw();
    });
    
    // Stars
    stars.forEach(s=>{s.update();s.draw();});
    
    // Shooting stars
    shootingStars.forEach(s=>{s.update();s.draw();});
    
    requestAnimationFrame(animate);
}

animate();

// ===== Intersection Observer for fade-in =====
const observerOptions={threshold:0.15,rootMargin:'0px 0px -50px 0px'};
const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
},observerOptions);

document.querySelectorAll('.section').forEach(section=>{
    section.classList.add('fade-section');
    observer.observe(section);
});