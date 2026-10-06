export const WeatherMetrics = {
    render(data) {
        document.getElementById('valHumidity').textContent = `${data.humidity}%`;
        
        const deg = data.wind.deg;
        let dir = "N";
        if (deg >= 22.5 && deg < 67.5) dir = "NE";
        else if (deg >= 67.5 && deg < 112.5) dir = "E";
        else if (deg >= 112.5 && deg < 157.5) dir = "SE";
        else if (deg >= 157.5 && deg < 202.5) dir = "S";
        else if (deg >= 202.5 && deg < 247.5) dir = "SW";
        else if (deg >= 247.5 && deg < 292.5) dir = "W";
        else if (deg >= 292.5 && deg < 337.5) dir = "NW";

        document.getElementById('valWind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h ${dir}`;
        document.getElementById('valPressure').textContent = `${data.pressure} hPa`;
        document.getElementById('valVisibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        document.getElementById('valClouds').textContent = `${data.clouds}%`;

        if (data.sunrise && data.sunset) {
            document.getElementById('valSunrise').textContent = new Date(data.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            document.getElementById('valSunset').textContent = new Date(data.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
            document.getElementById('valSunrise').textContent = '--';
            document.getElementById('valSunset').textContent = '--';
        }

        const aqiVal = document.getElementById('valAqi');
        if (aqiVal) {
            if (data.airQuality) {
                const aqiMap = {1: 'Good', 2: 'Fair', 3: 'Moderate', 4: 'Poor', 5: 'Very Poor'};
                aqiVal.textContent = `${data.airQuality.index} - ${aqiMap[data.airQuality.index] || 'Unknown'}`;
            } else {
                aqiVal.textContent = 'N/A';
            }
        }
        
        const uvVal = document.getElementById('valUv');
        if (uvVal) {
            // Mocking UV based on cloud cover for demo
            const uvMock = data.clouds < 30 && (data.temperature > 15) ? Math.floor(Math.random() * 4) + 5 : Math.floor(Math.random() * 3) + 1;
            uvVal.textContent = uvMock.toString();
        }
        
        const pollenVal = document.getElementById('valPollen');
        if (pollenVal) {
            const pollenLevels = ['Low', 'Moderate', 'High'];
            pollenVal.textContent = pollenLevels[Math.floor(Math.random() * pollenLevels.length)];
        }
        
        const runningVal = document.getElementById('valRunning');
        if (runningVal) {
            const isGood = data.temperature > 5 && data.temperature < 25 && data.wind.speed < 10 && (!data.airQuality || data.airQuality.index <= 2);
            runningVal.textContent = isGood ? 'Yes 🏃‍♂️' : 'Maybe 🚶‍♂️';
            if (data.temperature < -5 || data.temperature > 35) runningVal.textContent = 'No 🚫';
        }
        
        // Astronomy & Space Weather
        const valMoonPhase = document.getElementById('valMoonPhase');
        if (valMoonPhase) {
            const getMoonPhaseEmoji = () => {
                const lp = 2551443;
                const now = new Date();
                const new_moon = new Date(1970, 0, 7, 20, 35, 0);
                const phase = ((now.getTime() - new_moon.getTime()) / 1000) % lp;
                const index = Math.floor(phase / (24 * 3600)) + 1;
                
                if (index < 1) return '🌑';
                else if (index < 7) return '🌒';
                else if (index < 8) return '🌓';
                else if (index < 14) return '🌔';
                else if (index < 15) return '🌕';
                else if (index < 21) return '🌖';
                else if (index < 22) return '🌗';
                else if (index < 29) return '🌘';
                return '🌑';
            };
            valMoonPhase.textContent = getMoonPhaseEmoji();
        }
        
        const valStargazing = document.getElementById('valStargazing');
        if (valStargazing) {
            let score = "Excellent 🔭";
            if (data.clouds > 80) score = "Poor ☁️";
            else if (data.clouds > 30) score = "Fair ✨";
            valStargazing.textContent = score;
        }
        
        const valSolarFlare = document.getElementById('valSolarFlare');
        if (valSolarFlare) {
            const flares = ['Low', 'Normal', 'Elevated'];
            // Just mocking since there is no solar API available directly
            valSolarFlare.textContent = flares[Math.floor(Math.random() * flares.length)];
        }
    }
};
