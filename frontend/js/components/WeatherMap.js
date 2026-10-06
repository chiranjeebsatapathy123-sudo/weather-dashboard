let mapInstance = null;
let markerInstance = null;
let radarLayer = null;

export const WeatherMap = {
    async render(lat, lon, cityName) {
        const container = document.getElementById('weatherMap');
        if (!container || !window.L) return;

        // Delay slightly to ensure container is fully visible if switching tabs
        setTimeout(async () => {
            if (!mapInstance) {
                mapInstance = L.map('weatherMap').setView([lat, lon], 10);
                
                // Use CARTO Dark matter tiles for a premium look
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    attribution: '© OpenStreetMap, © CARTO',
                    maxZoom: 19
                }).addTo(mapInstance);
            } else {
                mapInstance.setView([lat, lon], 10);
            }

            if (markerInstance) {
                mapInstance.removeLayer(markerInstance);
            }

            markerInstance = L.marker([lat, lon]).addTo(mapInstance);
            markerInstance.bindPopup(`<b>${cityName}</b>`).openPopup();
            
            // Fetch and animate RainViewer radar layer
            try {
                if (radarLayer) {
                    mapInstance.removeLayer(radarLayer);
                }
                if (window.radarInterval) clearInterval(window.radarInterval);

                const rvData = await fetch('https://api.rainviewer.com/public/weather-maps.json').then(res => res.json());
                const pastFrames = rvData.radar.past;
                
                if (pastFrames && pastFrames.length > 0) {
                    let frameIndex = 0;
                    
                    const updateRadar = () => {
                        if (radarLayer) mapInstance.removeLayer(radarLayer);
                        const frame = pastFrames[frameIndex];
                        radarLayer = L.tileLayer(`https://tilecache.rainviewer.com/v2/radar/${frame.path}/256/{z}/{x}/{y}/2/1_1.png`, {
                            opacity: 0.65,
                            zIndex: 10
                        }).addTo(mapInstance);
                        
                        // Update time display if we had a dedicated UI for it
                        // console.log("Radar time:", new Date(frame.time * 1000).toLocaleTimeString());
                        
                        frameIndex = (frameIndex + 1) % pastFrames.length;
                    };
                    
                    updateRadar();
                    window.radarInterval = setInterval(updateRadar, 1500); // 1.5s per frame
                }
            } catch (e) {
                console.error("Could not load radar data", e);
            }

            // Fix map sizing issues if container was hidden
            mapInstance.invalidateSize();
            
            // Start 3D Particle Engine based on current weather condition
            startParticleEngine();
        }, 300);
    }
};

let animationFrameId = null;

function startParticleEngine() {
    const canvas = document.getElementById('weatherParticleCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const condition = window.currentWeatherData?.condition?.toLowerCase() || 'clear';
    
    // Set canvas resolution to container size
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let particles = [];
    let isRaining = condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm');
    let isSnowing = condition.includes('snow');
    
    if (!isRaining && !isSnowing) {
        // Fallback or demo mode for testing: Force rain if it's clear just to show the feature, 
        // wait, let's just show it if it's actually raining. But for "Pro demo" purposes, 
        // if user wants to see it, we can spawn a few light particles or just leave it clear.
        // Let's leave it clear unless raining/snowing to be accurate.
        return; 
    }
    
    const particleCount = isRaining ? 150 : 100;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: isRaining ? (Math.random() * 20 + 10) : (Math.random() * 4 + 2),
            speed: isRaining ? (Math.random() * 15 + 10) : (Math.random() * 2 + 1),
            angle: isRaining ? (Math.random() * 0.1 - 0.05) : (Math.random() * 0.5 - 0.25),
            opacity: Math.random() * 0.5 + 0.2
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Darken the map slightly during intense weather
        ctx.fillStyle = isRaining ? 'rgba(0,0,50,0.2)' : 'rgba(200,200,255,0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.lineCap = 'round';
        
        particles.forEach(p => {
            ctx.beginPath();
            
            if (isRaining) {
                ctx.strokeStyle = \`rgba(174, 194, 224, \${p.opacity})\`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.sin(p.angle) * p.length, p.y + Math.cos(p.angle) * p.length);
                ctx.stroke();
            } else if (isSnowing) {
                ctx.fillStyle = \`rgba(255, 255, 255, \${p.opacity})\`;
                ctx.arc(p.x, p.y, p.length, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Move
            p.x += Math.sin(p.angle) * p.speed;
            p.y += Math.cos(p.angle) * p.speed;
            
            // Reset
            if (p.y > canvas.height || p.x > canvas.width || p.x < 0) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        const newRect = canvas.parentElement.getBoundingClientRect();
        canvas.width = newRect.width;
        canvas.height = newRect.height;
    });
}
