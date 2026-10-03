const fetchWithTimeout = async (url, timeoutMs = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        return await response.json();
    } catch (err) {
        throw err;
    }
};

const fetchHistoricalWeather = async (lat, lon, days = 7) => {
    const end = new Date();
    end.setDate(end.getDate() - 1); // Yesterday
    
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));

    const formatDate = (date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(start);
    const endDateStr = formatDate(end);

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
    
    try {
        const data = await fetchWithTimeout(url);
        if (data && data.daily) {
            const mapped = data.daily.time.map((time, index) => ({
                date: time,
                tempHigh: data.daily.temperature_2m_max[index],
                tempLow: data.daily.temperature_2m_min[index],
                precipitation: data.daily.precipitation_sum[index]
            }));
            return mapped;
        }
        return [];
    } catch (err) {
        return []; // Graceful degradation, do not fabricate
    }
};

module.exports = {
    fetchHistoricalWeather
};
