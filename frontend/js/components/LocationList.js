export const LocationList = {
    render(elementId, data, isFav, emptyText) {
        const list = document.getElementById(elementId);
        list.innerHTML = '';
        
        if (!data || data.length === 0) {
            list.innerHTML = `<p style="opacity:0.6; padding:10px;">${emptyText}</p>`;
            return;
        }
        
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'loc-item';
            div.innerHTML = `<span>${item.city}</span>`;
            
            if (isFav) {
                const btn = document.createElement('button');
                btn.className = 'icon-btn';
                btn.innerHTML = '×';
                btn.style.width = '24px'; btn.style.height = '24px';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    if (window.removeFavorite) window.removeFavorite(item.city);
                };
                div.appendChild(btn);
            }
            
            div.onclick = () => {
                if (window.loadCity) window.loadCity(item.city);
            };
            
            list.appendChild(div);
        });
    }
};
