export const translations = {
    en: {
        "app_title": "Weather Intelligence",
        "search_placeholder": "Search for a city...",
        "use_location": "📍 Use my location",
        "install_app": "⬇️ Install App",
        "24h_forecast": "24-Hour Forecast",
        "compare_locations": "Compare Locations",
        "trip_planner": "Trip Weather Planner"
    },
    es: {
        "app_title": "Inteligencia Meteorológica",
        "search_placeholder": "Buscar una ciudad...",
        "use_location": "📍 Usar mi ubicación",
        "install_app": "⬇️ Instalar App",
        "24h_forecast": "Pronóstico de 24 horas",
        "compare_locations": "Comparar Ubicaciones",
        "trip_planner": "Planificador de Viajes"
    },
    fr: {
        "app_title": "Intelligence Météo",
        "search_placeholder": "Rechercher une ville...",
        "use_location": "📍 Utiliser ma position",
        "install_app": "⬇️ Installer l'App",
        "24h_forecast": "Prévisions sur 24h",
        "compare_locations": "Comparer les Lieux",
        "trip_planner": "Planificateur de Voyage"
    }
};

let currentLang = 'en';

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        applyTranslations();
    }
}

function applyTranslations() {
    const dict = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });
}
