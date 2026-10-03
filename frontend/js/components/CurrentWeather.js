export const CurrentWeather = {
    render(data) {
        document.getElementById('cityName').textContent = `${data.location.name}${data.location.country ? ', ' + data.location.country : ''}`;
        document.getElementById('weatherDesc').textContent = data.condition.description;
        document.getElementById('currentTemp').textContent = Math.round(data.temperature);
        
        let feelsLikeExplanation = '';
        if (data.feelsLike > data.temperature + 2) {
            feelsLikeExplanation = ' Feels warmer because of high humidity.';
        } else if (data.feelsLike < data.temperature - 2) {
            feelsLikeExplanation = ' Feels colder due to the wind.';
        }
        document.getElementById('feelsLike').textContent = `${Math.round(data.feelsLike)}${feelsLikeExplanation ? ' —' + feelsLikeExplanation : ''}`;
        
        document.getElementById('tempHigh').textContent = Math.round(data.tempHigh || data.temperature);
        document.getElementById('tempLow').textContent = Math.round(data.tempLow || data.temperature);

        const iconEl = document.getElementById('weatherIcon');
        iconEl.src = `https://openweathermap.org/img/wn/${data.condition.icon}@4x.png`;
        iconEl.style.display = 'block';
    }
};
