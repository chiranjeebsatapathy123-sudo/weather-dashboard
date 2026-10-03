import { api } from '../api.js';

export const LocationList = {
    async render(elementId, data, isFav, emptyText) {
        const list = document.getElementById(elementId);
        list.innerHTML = '';
        
        if (!data || data.length === 0) {
            if (isFav) {
                list.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; background: rgba(0,0,0,0.1);">
                        <div style="opacity: 0.6; margin-bottom: 20px; font-size: 1rem;">${emptyText}</div>
                        <div style="font-size: 0.85rem; color: #a5d6ff; margin-bottom: 10px;">Quick Add Popular Locations:</div>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button onclick="document.getElementById('addLocationInput').value='New York'; saveCustomLocation()" class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">+ New York</button>
                            <button onclick="document.getElementById('addLocationInput').value='London'; saveCustomLocation()" class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">+ London</button>
                            <button onclick="document.getElementById('addLocationInput').value='Tokyo'; saveCustomLocation()" class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">+ Tokyo</button>
                            <button onclick="document.getElementById('addLocationInput').value='Paris'; saveCustomLocation()" class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem;">+ Paris</button>
                        </div>
                    </div>
                `;
            } else {
                list.innerHTML = `<p style="opacity:0.6; padding:10px;">${emptyText}</p>`;
            }
            return;
        }
        
        if (isFav) {
            list.classList.add('advanced-location-list');
        } else {
            list.classList.remove('advanced-location-list');
        }

        for (const item of data) {
            const div = document.createElement('div');
            div.className = isFav ? 'advanced-loc-card glass-card' : 'loc-item';
            
            if (isFav) {
                div.innerHTML = `<div class="loc-card-header">
                                    <h3>${item.city}</h3>
                                    <div class="skeleton skeleton-text" style="width: 40px;"></div>
                                 </div>
                                 <div class="skeleton skeleton-text" style="width: 80px; margin-top: 10px;"></div>`;
                                 
                list.appendChild(div);
                
                // Fetch live weather data for advanced card
                try {
                    const weather = await api.get(`/weather?city=${encodeURIComponent(item.city)}`);
                    div.innerHTML = `
                        <div class="loc-card-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="margin:0; font-size: 1.2rem;">${weather.location.name}, ${weather.location.country}</h3>
                            <div class="loc-actions">
                                <button class="icon-btn del-btn" title="Remove" style="background:rgba(255,50,50,0.2); color:#ff5555; width:28px; height:28px;">×</button>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap: 15px; margin-top: 15px;">
                            <i class="wi wi-${weather.condition.icon}" style="font-size: 2.5rem; color: var(--primary);"></i>
                            <div>
                                <div style="font-size: 1.8rem; font-weight: bold;">${Math.round(weather.current.temp)}°C</div>
                                <div style="opacity: 0.8; font-size: 0.9rem;">${weather.condition.text}</div>
                            </div>
                        </div>
                        <div style="margin-top: 15px; display:flex; gap: 15px; font-size: 0.85rem; opacity: 0.7;">
                            <span><i class="wi wi-humidity"></i> ${weather.current.humidity}%</span>
                            <span><i class="wi wi-strong-wind"></i> ${weather.current.wind_kph} km/h</span>
                        </div>
                    `;
                    
                    const delBtn = div.querySelector('.del-btn');
                    delBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (window.removeFavorite) window.removeFavorite(item.city);
                    };
                    
                    div.onclick = () => {
                        if (window.loadCity) {
                            document.querySelector('.sidebar-nav li[data-view="dashboard"]').click();
                            window.loadCity(weather.location.name);
                        }
                    };
                    div.style.cursor = 'pointer';
                    div.style.transition = 'transform 0.2s';
                    div.onmouseover = () => div.style.transform = 'translateY(-2px)';
                    div.onmouseout = () => div.style.transform = 'translateY(0)';
                    
                } catch (e) {
                    div.innerHTML = `<div class="loc-card-header">
                                        <h3>${item.city}</h3>
                                        <button class="icon-btn del-btn" title="Remove" style="background:rgba(255,50,50,0.2); color:#ff5555; width:28px; height:28px;">×</button>
                                     </div>
                                     <div style="color:#ff5555; margin-top:10px; font-size:0.9rem;">Data unavailable</div>`;
                    div.querySelector('.del-btn').onclick = (e) => {
                        e.stopPropagation();
                        if (window.removeFavorite) window.removeFavorite(item.city);
                    };
                }
            } else {
                div.innerHTML = `<span>${item.city}</span>`;
                div.onclick = () => {
                    if (window.loadCity) {
                        document.querySelector('.sidebar-nav li[data-view="dashboard"]').click();
                        window.loadCity(item.city);
                    }
                };
                list.appendChild(div);
            }
        }
    }
};
