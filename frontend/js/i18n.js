export const translations = {
    en: {
        "app_title": "Weather Intelligence",
        "search_placeholder": "Search for a city...",
        "use_location": "📍 Use my location",
        "install_app": "⬇️ Install App",
        "upgrade_pro": "✨ Upgrade to Pro",
        "nav_dashboard": "Dashboard",
        "nav_locations": "Locations",
        "nav_alerts": "Alerts",
        "nav_trip": "Trip Planner",
        "nav_map": "Map",
        "nav_history": "History",
        "nav_compare": "Compare",
        "nav_smart_home": "Smart Home",
        "nav_time_machine": "Time Machine",
        "nav_aviation": "Aviation",
        "nav_agriculture": "Agriculture",
        "nav_weather_ai": "Weather AI",
        "nav_settings": "Settings",
        "pro_tools": "Pro Tools",
        "what_matters_now": "What Matters Now",
        "personal_brief": "Personal Weather Brief",
        "your_plan": "Your Plan",
        "space_weather": "✨ Space Weather & Astronomy",
        "24h_forecast": "24-Hour Forecast",
        "5day_forecast": "5-Day Forecast",
        "saved_locations": "Saved Locations",
        "recent_searches": "Recent Searches",
        "compare_locations": "Compare Locations",
        "trip_planner": "Trip Weather Planner",
        "historical_7days": "Historical Data (7 Days)"
    },
    es: {
        "app_title": "Inteligencia Meteorológica",
        "search_placeholder": "Buscar una ciudad...",
        "use_location": "📍 Usar mi ubicación",
        "install_app": "⬇️ Instalar App",
        "upgrade_pro": "✨ Mejorar a Pro",
        "nav_dashboard": "Panel de Control",
        "nav_locations": "Ubicaciones",
        "nav_alerts": "Alertas",
        "nav_trip": "Planificador de Viajes",
        "nav_map": "Mapa",
        "nav_history": "Historial",
        "nav_compare": "Comparar",
        "nav_smart_home": "Hogar Inteligente",
        "nav_time_machine": "Máquina del Tiempo",
        "nav_aviation": "Aviación",
        "nav_agriculture": "Agricultura",
        "nav_weather_ai": "IA Meteorológica",
        "nav_settings": "Configuración",
        "pro_tools": "Herramientas Pro",
        "what_matters_now": "Lo Importante Ahora",
        "personal_brief": "Resumen Meteorológico Personal",
        "your_plan": "Tu Plan",
        "space_weather": "✨ Clima Espacial y Astronomía",
        "24h_forecast": "Pronóstico de 24 horas",
        "5day_forecast": "Pronóstico de 5 Días",
        "saved_locations": "Ubicaciones Guardadas",
        "recent_searches": "Búsquedas Recientes",
        "compare_locations": "Comparar Ubicaciones",
        "trip_planner": "Planificador de Viajes",
        "historical_7days": "Datos Históricos (7 Días)"
    },
    fr: {
        "app_title": "Intelligence Météo",
        "search_placeholder": "Rechercher une ville...",
        "use_location": "📍 Utiliser ma position",
        "install_app": "⬇️ Installer l'App",
        "upgrade_pro": "✨ Passer à Pro",
        "nav_dashboard": "Tableau de Bord",
        "nav_locations": "Lieux",
        "nav_alerts": "Alertes",
        "nav_trip": "Planificateur de Voyage",
        "nav_map": "Carte",
        "nav_history": "Historique",
        "nav_compare": "Comparer",
        "nav_smart_home": "Maison Connectée",
        "nav_time_machine": "Machine Temporelle",
        "nav_aviation": "Aviation",
        "nav_agriculture": "Agriculture",
        "nav_weather_ai": "IA Météo",
        "nav_settings": "Paramètres",
        "pro_tools": "Outils Pro",
        "what_matters_now": "Ce qui compte maintenant",
        "personal_brief": "Bulletin Météo Personnel",
        "your_plan": "Votre Programme",
        "space_weather": "✨ Météo Spatiale et Astronomie",
        "24h_forecast": "Prévisions sur 24h",
        "5day_forecast": "Prévisions sur 5 Jours",
        "saved_locations": "Lieux Sauvegardés",
        "recent_searches": "Recherches Récentes",
        "compare_locations": "Comparer les Lieux",
        "trip_planner": "Planificateur de Voyage",
        "historical_7days": "Données Historiques (7 Jours)"
    }
};

let currentLang = localStorage.getItem('weatheros_lang') || 'en';

export function getLanguage() {
    return currentLang;
}

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLang = lang;
        localStorage.setItem('weatheros_lang', lang);
        applyTranslations();
    }
}

export function applyTranslations() {
    const dict = translations[currentLang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (el.tagName === 'INPUT') {
                el.placeholder = dict[key];
            } else {
                // If element has child elements (like icons/svg), update text node if present
                const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                if (textNodes.length > 0) {
                    textNodes[textNodes.length - 1].textContent = ' ' + dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        }
    });

    const langSelect = document.getElementById('langSelect');
    if (langSelect && langSelect.value !== currentLang) {
        langSelect.value = currentLang;
    }
}

// Auto-apply on load
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyTranslations();
        });
    } else {
        applyTranslations();
    }
}
