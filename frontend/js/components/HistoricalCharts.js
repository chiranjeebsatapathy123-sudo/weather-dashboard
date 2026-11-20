import { formatTemp, getTempSymbol } from '../units.js';

let chartInstance = null;
let lastHistoryData = null;
let lastPredictedTemp = null;

export const HistoricalCharts = {
    render(historyData, predictedTomorrowHigh = null) {
        if (historyData) lastHistoryData = historyData;
        if (predictedTomorrowHigh !== null && predictedTomorrowHigh !== undefined) {
            lastPredictedTemp = predictedTomorrowHigh;
        }
        const dataToRender = historyData || lastHistoryData;

        const ctx = document.getElementById('historyChart');
        if (!ctx) return;

        if (!dataToRender || dataToRender.length === 0) {
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

        const labels = dataToRender.map(h => {
            const d = new Date(h.date);
            return d.toLocaleDateString([], { weekday: 'short' });
        });
        
        const tempHigh = dataToRender.map(h => formatTemp(h.tempHigh));
        const tempLow = dataToRender.map(h => formatTemp(h.tempLow));
        const precip = dataToRender.map(h => h.precipitation);

        const currentTheme = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme');
        const isDark = currentTheme !== 'light';
        const textColor = isDark ? '#f8fafc' : '#0f172a';
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const unitSymbol = getTempSymbol();

        const datasets = [
            {
                label: `High (${unitSymbol})`,
                data: tempHigh,
                borderColor: '#ef4444',
                backgroundColor: '#ef4444',
                tension: 0.3
            },
            {
                label: `Low (${unitSymbol})`,
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
        ];

        // If AI Neural Predictor produced tomorrow's predicted high
        if (lastPredictedTemp !== null && lastPredictedTemp !== undefined) {
            labels.push('Tomorrow (AI)');
            const predData = new Array(tempHigh.length).fill(null);
            predData[tempHigh.length - 1] = tempHigh[tempHigh.length - 1]; // connect from last real day
            predData.push(formatTemp(lastPredictedTemp));
            
            datasets.push({
                label: `AI Prediction (${unitSymbol})`,
                data: predData,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderDash: [6, 4],
                borderWidth: 2,
                pointBackgroundColor: '#a855f7',
                pointRadius: 6,
                tension: 0.3
            });
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        if (typeof Chart === 'undefined') return;

        chartInstance = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: { ticks: { color: textColor }, grid: { display: false } },
                    y: { 
                        type: 'linear', display: true, position: 'left',
                        ticks: { color: textColor }, grid: { color: gridColor }
                    },
                    y1: {
                        type: 'linear', display: true, position: 'right',
                        ticks: { color: textColor }, grid: { display: false },
                        min: 0,
                        suggestedMax: 10
                    }
                },
                plugins: {
                    legend: { labels: { color: textColor } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
};

window.addEventListener('resize', () => {
    if (lastHistoryData) {
        HistoricalCharts.render(lastHistoryData, lastPredictedTemp);
    }
});
