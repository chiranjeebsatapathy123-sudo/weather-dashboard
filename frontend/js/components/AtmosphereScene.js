export const AtmosphereScene = {
    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'atmosphereCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.condition = 'clear';
        this.active = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        window.addEventListener('resize', () => this.resize());
        this.resize();
        
        if (this.active) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.drawStaticScene();
        }
    },
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (!this.active) this.drawStaticScene();
    },
    
    updateCondition(conditionCode) {
        // Map OpenWeather code to scene
        if (conditionCode >= 200 && conditionCode < 300) this.condition = 'storm';
        else if (conditionCode >= 300 && conditionCode < 600) this.condition = 'rain';
        else if (conditionCode >= 600 && conditionCode < 700) this.condition = 'snow';
        else if (conditionCode >= 700 && conditionCode < 800) this.condition = 'fog';
        else if (conditionCode === 800) this.condition = 'clear';
        else this.condition = 'cloudy';
        
        this.initParticles();
        if (!this.active) this.drawStaticScene();
    },
    
    initParticles() {
        this.particles = [];
        const count = this.condition === 'rain' ? 100 : this.condition === 'snow' ? 150 : 20;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedY: this.condition === 'rain' ? Math.random() * 10 + 10 : this.condition === 'snow' ? Math.random() * 2 + 1 : Math.random() * 0.5 - 0.25,
                speedX: this.condition === 'rain' ? Math.random() * 2 - 1 : this.condition === 'snow' ? Math.random() * 1 - 0.5 : Math.random() * 0.5 - 0.25,
                opacity: Math.random() * 0.5 + 0.1
            });
        }
    },
    
    drawStaticScene() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        if (this.condition === 'clear') {
            grad.addColorStop(0, 'rgba(14, 165, 233, 0.1)');
            grad.addColorStop(1, 'rgba(2, 6, 23, 0.8)');
        } else if (this.condition === 'rain' || this.condition === 'storm') {
            grad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
            grad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
        } else {
            grad.addColorStop(0, 'rgba(51, 65, 85, 0.2)');
            grad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
        }
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    },
    
    animate() {
        if (!this.active) return;
        
        this.drawStaticScene(); // Draw base gradient
        
        // Draw particles
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        if (this.condition === 'rain') this.ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
        
        this.particles.forEach(p => {
            this.ctx.beginPath();
            if (this.condition === 'rain') {
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 2);
                this.ctx.strokeStyle = this.ctx.fillStyle;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            } else {
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            p.y += p.speedY;
            p.x += p.speedX;
            
            if (p.y > this.canvas.height) {
                p.y = 0;
                p.x = Math.random() * this.canvas.width;
            }
            if (p.x > this.canvas.width) p.x = 0;
            if (p.x < 0) p.x = this.canvas.width;
        });
        
        requestAnimationFrame(() => this.animate());
    }
};
