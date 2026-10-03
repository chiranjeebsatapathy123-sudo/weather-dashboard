export const WeatherInsight = {
    render(insights) {
        const list = document.getElementById('insightsList');
        list.innerHTML = '';
        
        if (!insights || insights.length === 0) {
            list.innerHTML = '<p class="insight-item">No specific insights at this time.</p>';
            return;
        }
        
        insights.forEach(ins => {
            const p = document.createElement('p');
            p.className = `insight-item ${ins.type || 'info'}`;
            p.textContent = ins.text;
            list.appendChild(p);
        });
    }
};
