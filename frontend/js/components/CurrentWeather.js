import { formatTemp, getTempSymbol } from '../units.js';

export const CurrentWeather = {
    render(data) {
        document.getElementById('cityName').textContent = `${data.location.name}${data.location.country ? ', ' + data.location.country : ''}`;
        document.getElementById('weatherDesc').textContent = data.condition.description;
        document.getElementById('currentTemp').textContent = formatTemp(data.temperature);
        
        // Update unit indicators
        const symbol = getTempSymbol();
        document.querySelectorAll('.unit').forEach(el => el.textContent = symbol);
        
        let feelsLikeExplanation = '';
        if (data.feelsLike > data.temperature + 2) {
            feelsLikeExplanation = ' Feels warmer because of high humidity.';
        } else if (data.feelsLike < data.temperature - 2) {
            feelsLikeExplanation = ' Feels colder due to the wind.';
        }
        document.getElementById('feelsLike').textContent = `${formatTemp(data.feelsLike)}${feelsLikeExplanation ? ' —' + feelsLikeExplanation : ''}`;
        
        document.getElementById('tempHigh').textContent = formatTemp(data.tempHigh || data.temperature);
        document.getElementById('tempLow').textContent = formatTemp(data.tempLow || data.temperature);

        const iconEl = document.getElementById('weatherIcon');
        iconEl.src = `https://openweathermap.org/img/wn/${data.condition.icon}@4x.png`;
        iconEl.style.display = 'block';
    }
};
