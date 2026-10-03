-- Weather Intelligence 2.0 Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Ready for auth integration in Phase 3)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table (Normalized)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    country_code VARCHAR(2),
    state VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(LOWER(name));

-- Favorites Table (Now supports user_id and location_id for future, keeps city for backwards compat during migration)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL, -- Legacy compat
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_favorites_city ON favorites(LOWER(city));

-- Search History Table (Normalized)
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    city VARCHAR(255) NOT NULL, -- Legacy compat
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at DESC);

-- Weather Cache Table (For DB-backed caching if moving away from in-memory)
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_weather_cache_expires_at ON weather_cache(expires_at);

-- Alerts/Notifications Table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    units VARCHAR(20) DEFAULT 'metric',
    theme VARCHAR(20) DEFAULT 'system',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Locations (Phase 4: organizing favorite locations properly)
CREATE TABLE IF NOT EXISTS user_locations (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, location_id)
);

-- Weather Alerts (Phase 4: alerts from provider)
CREATE TABLE IF NOT EXISTS weather_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    alert_type VARCHAR(100),
    severity VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    affected_area VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_location ON weather_alerts(location_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_is_active ON weather_alerts(is_active);

-- Alert Preferences
CREATE TABLE IF NOT EXISTS alert_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    severe_weather BOOLEAN DEFAULT true,
    heavy_rain BOOLEAN DEFAULT true,
    thunderstorms BOOLEAN DEFAULT true,
    extreme_heat BOOLEAN DEFAULT true,
    poor_air_quality BOOLEAN DEFAULT true,
    high_uv BOOLEAN DEFAULT false,
    daily_forecast BOOLEAN DEFAULT true,
    rain_probability_threshold INTEGER DEFAULT 70,
    notify_window VARCHAR(50) DEFAULT 'Anytime',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Phase 6: User Weather Preferences
CREATE TABLE IF NOT EXISTS user_weather_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    temperature_unit VARCHAR(10) DEFAULT 'celsius',
    wind_unit VARCHAR(10) DEFAULT 'kmh',
    precipitation_unit VARCHAR(10) DEFAULT 'mm',
    reduced_motion BOOLEAN DEFAULT false,
    daily_brief_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Phase 6: Activity Profiles
CREATE TABLE IF NOT EXISTS activity_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    rain_threshold INTEGER,
    wind_threshold INTEGER,
    uv_threshold INTEGER,
    aqi_threshold INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activity_profiles_user ON activity_profiles(user_id);

-- Phase 6: Forecast Snapshots (For change detection)
CREATE TABLE IF NOT EXISTS forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    forecast_time TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_for TIMESTAMP WITH TIME ZONE NOT NULL,
    temperature DECIMAL(5,2),
    precipitation_probability INTEGER,
    wind_speed DECIMAL(5,2),
    condition VARCHAR(50),
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_location ON forecast_snapshots(location_id, predicted_for);

-- Phase 6: Recommendation History
CREATE TABLE IF NOT EXISTS recommendation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    activity_type VARCHAR(50),
    recommendation TEXT,
    weather_context_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
