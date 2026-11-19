import { api } from '../api.js';

export const LocationList = {
    async render(elementId, data, isFav, emptyText) {
        const list = document.getElementById(elementId);
        if (!list) return;
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
                    const weather = await api.get(`/weather/current?city=${encodeURIComponent(item.city)}`);
                    const country = weather.location?.country ? `, ${weather.location.country}` : '';
                    const temp = weather.temperature !== null && weather.temperature !== undefined ? `${Math.round(weather.temperature)}°C` : '--';
                    const desc = weather.condition?.description || 'Clear';
                    const iconUrl = weather.condition?.icon ? `https://openweathermap.org/img/wn/${weather.condition.icon}.png` : '';
                    const humidity = weather.humidity !== null && weather.humidity !== undefined ? `${weather.humidity}%` : '--';
                    const wind = weather.wind?.speed !== null && weather.wind?.speed !== undefined ? `${Math.round(weather.wind.speed * 3.6)} km/h` : '--';

                    div.innerHTML = `
                        <div class="loc-card-header" style="display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="margin:0; font-size: 1.1rem;">${weather.location.name}${country}</h3>
                            <div class="loc-actions">
                                <button class="icon-btn del-btn" title="Remove" style="background:rgba(255,50,50,0.2); color:#ff5555; width:28px; height:28px;">×</button>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap: 12px; margin-top: 12px;">
                            ${iconUrl ? `<img src="${iconUrl}" alt="${desc}" style="width: 48px; height: 48px;">` : ''}
                            <div>
                                <div style="font-size: 1.5rem; font-weight: bold;">${temp}</div>
                                <div style="opacity: 0.8; font-size: 0.85rem; text-transform: capitalize;">${desc}</div>
                            </div>
                        </div>
                        <div style="margin-top: 12px; display:flex; gap: 15px; font-size: 0.85rem; opacity: 0.7;">
                            <span>💧 ${humidity}</span>
                            <span>💨 ${wind}</span>
                        </div>
                    `;
                    
                    const delBtn = div.querySelector('.del-btn');
                    if (delBtn) {
                        delBtn.onclick = (e) => {
                            e.stopPropagation();
                            if (window.removeFavorite) window.removeFavorite(item.city);
                        };
                    }
                    
                    div.onclick = () => {
                        if (window.loadCity) {
                            window.loadCity(weather.location?.name || item.city);
                        }
                    };
                    div.style.cursor = 'pointer';
                    div.style.transition = 'transform 0.2s';
                    div.onmouseover = () => div.style.transform = 'translateY(-2px)';
                    div.onmouseout = () => div.style.transform = 'translateY(0)';
                    
                } catch (e) {
                    div.innerHTML = `<div class="loc-card-header" style="display:flex; justify-content:space-between; align-items:center;">
                                        <h3>${item.city}</h3>
                                        <button class="icon-btn del-btn" title="Remove" style="background:rgba(255,50,50,0.2); color:#ff5555; width:28px; height:28px;">×</button>
                                     </div>
                                     <div style="color:var(--text-secondary); margin-top:10px; font-size:0.85rem;">Click to load weather</div>`;
                    const delBtn = div.querySelector('.del-btn');
                    if (delBtn) {
                        delBtn.onclick = (e) => {
                            e.stopPropagation();
                            if (window.removeFavorite) window.removeFavorite(item.city);
                        };
                    }
                    div.onclick = () => {
                        if (window.loadCity) window.loadCity(item.city);
                    };
                }
            } else {
                div.innerHTML = `<span>${item.city}</span>`;
                div.onclick = () => {
                    if (window.loadCity) {
                        window.loadCity(item.city);
                    }
                };
                list.appendChild(div);
            }
        }
    }
};
