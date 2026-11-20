export function getUnit() {
    try {
        const configStr = localStorage.getItem('weatheros_config');
        if (configStr) {
            const config = JSON.parse(configStr);
            if (config.unit === 'F' || config.unit === 'C') return config.unit;
        }
    } catch (e) {}
    return 'C';
}

export function setUnit(unit) {
    try {
        const configStr = localStorage.getItem('weatheros_config') || '{}';
        const config = JSON.parse(configStr);
        config.unit = unit === 'F' ? 'F' : 'C';
        localStorage.setItem('weatheros_config', JSON.stringify(config));
    } catch (e) {}
}

export function formatTemp(celsius) {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
    const c = Number(celsius);
    if (getUnit() === 'F') {
        return Math.round(c * 1.8 + 32);
    }
    return Math.round(c);
}

export function getTempSymbol() {
    return getUnit() === 'F' ? '°F' : '°C';
}

export function formatSpeed(mps) {
    if (mps === null || mps === undefined || isNaN(mps)) return '--';
    const s = Number(mps);
    if (getUnit() === 'F') {
        return `${Math.round(s * 2.23694)} mph`;
    }
    return `${Math.round(s * 3.6)} km/h`;
}

export function formatDistance(meters) {
    if (meters === null || meters === undefined || isNaN(meters)) return '--';
    const km = meters / 1000;
    if (getUnit() === 'F') {
        return `${(km * 0.621371).toFixed(1)} mi`;
    }
    return `${km.toFixed(1)} km`;
}

export function formatTempRaw(celsius) {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
    const c = Number(celsius);
    if (getUnit() === 'F') {
        return Math.round(c * 1.8 + 32);
    }
    return Math.round(c);
}
