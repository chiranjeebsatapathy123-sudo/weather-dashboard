export const AlertCenter = {
    render(alerts) {
        const list = document.getElementById('alertsList');
        const badge = document.getElementById('notifBadge');
        
        list.innerHTML = '';
        
        if (!alerts || alerts.length === 0) {
            list.innerHTML = '<p style="opacity: 0.6; padding: 16px;">No active alerts at this time.</p>';
            if (badge) badge.style.display = 'none';
            return;
        }

        if (badge) {
            badge.textContent = alerts.length;
            badge.style.display = 'flex';
        }

        alerts.forEach(alert => {
            const card = document.createElement('div');
            let severityClass = 'notice';
            if (alert.severity === 'HIGH' || alert.severity === 'WARNING' || alert.severity === 'EMERGENCY') severityClass = 'alert';
            if (alert.severity === 'MODERATE' || alert.severity === 'WATCH') severityClass = 'warning';
            
            card.className = `alert-card ${severityClass}`;
            card.innerHTML = `
                <div class="alert-title">
                    ${severityClass === 'alert' ? '⚠' : severityClass === 'warning' ? '⚠' : 'ℹ'} 
                    ${alert.title}
                </div>
                <div class="alert-desc">${alert.description}</div>
                <div class="alert-source">Source: ${alert.source || 'WeatherOS'}</div>
            `;
            list.appendChild(card);
        });
    }
};
