let chartInstance = null;

export const HistoricalCharts = {
    render(historyData) {
        const ctx = document.getElementById('historyChart');
        if (!ctx) return;

        if (!historyData || historyData.length === 0) {
            ctx.style.display = 'none';
            let noText = document.getElementById('noHistoryText');
            if (!noText) {
                noText = document.createElement('p');
                noText.id = 'noHistoryText';
                noText.style.cssText = 'opacity: 0.6; padding: 16px;';
                noText.innerText = 'No historical data is available for this location.';
                ctx.parentElement.appendChild(noText);
            }
            noText.style.display = 'block';
            return;
        } else {
            ctx.style.display = 'block';
            const noText = document.getElementById('noHistoryText');
            if (noText) noText.style.display = 'none';
        }

        const labels = historyData.map(h => {
            const d = new Date(h.date);
            return d.toLocaleDateString([], { weekday: 'short' });
        });
        
        const tempHigh = historyData.map(h => h.tempHigh);
        const tempLow = historyData.map(h => h.tempLow);
        const precip = historyData.map(h => h.precipitation);

        const isDark = document.body.getAttribute('data-theme') !== 'light';
        const textColor = isDark ? '#f8fafc' : '#0f172a';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'High (°C)',
                        data: tempHigh,
                        borderColor: '#ef4444',
                        backgroundColor: '#ef4444',
                        tension: 0.3
                    },
                    {
                        label: 'Low (°C)',
                        data: tempLow,
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f6',
                        tension: 0.3
                    },
                    {
                        type: 'bar',
                        label: 'Rain (mm)',
                        data: precip,
                        backgroundColor: 'rgba(56, 189, 248, 0.5)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { color: textColor }, grid: { display: false } },
                    y: { 
                        type: 'linear', display: true, position: 'left',
                        ticks: { color: textColor }, grid: { color: gridColor }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right',
                        ticks: { color: textColor }, grid: { display: false }
                    }
                },
                plugins: {
                    legend: { labels: { color: textColor } }
                }
            }
        });
    }
};
