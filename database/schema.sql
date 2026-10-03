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

-- ==========================================
-- PHASE 12: GIS, IoT, & Developer Platform
-- ==========================================

-- Organizations (Tenant Root) (Added conceptually in Phase 11, formalized here)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, organization_id)
);

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_workspaces_org ON workspaces(organization_id);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    scopes JSONB,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);

-- Webhooks 2.0
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    event_types JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks(organization_id);

-- IoT Devices
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    device_type VARCHAR(100) NOT NULL,
    mac_address VARCHAR(50),
    status VARCHAR(50) DEFAULT 'OFFLINE',
    last_seen TIMESTAMP WITH TIME ZONE,
    firmware_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_devices_org ON devices(organization_id);

-- IoT Telemetry
CREATE TABLE IF NOT EXISTS device_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    pressure DECIMAL(6,2),
    wind_speed DECIMAL(5,2),
    wind_dir INTEGER,
    rain DECIMAL(5,2),
    aqi INTEGER,
    raw_payload JSONB,
    quality_flag VARCHAR(20) DEFAULT 'VALID',
    measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON device_telemetry(device_id, measured_at DESC);

-- GIS Geofences (Fallback abstract, PostGIS prepared)
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'POLYGON',
    coordinates JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_geofences_org ON geofences(organization_id);

-- ==========================================
-- PHASE 13: Digital Twins & AI Agents
-- ==========================================

-- Digital Twin Entities
CREATE TABLE IF NOT EXISTS digital_twins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'CAMPUS', 'BUILDING', 'FIELD'
    metadata JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hierarchical Twin Relationships
CREATE TABLE IF NOT EXISTS twin_relationships (
    parent_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
    child_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) DEFAULT 'CONTAINS',
    PRIMARY KEY (parent_id, child_id)
);

-- Twin State Snapshots (For Timeline and Baseline)
CREATE TABLE IF NOT EXISTS twin_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    twin_id UUID REFERENCES digital_twins(id) ON DELETE CASCADE,
    state_payload JSONB NOT NULL, -- Merged Weather + Telemetry + Alerts
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_twin_states_time ON twin_states(twin_id, recorded_at DESC);

-- What-If Scenarios
CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    base_state JSONB NOT NULL,
    offsets JSONB NOT NULL, -- e.g., {"temperature": 3, "rain": 20}
    projected_impact JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Predictive Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'POTENTIAL', -- WATCH, POTENTIAL, CONFIRMED, RESOLVED
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Incident Timelines (Event Replay)
CREATE TABLE IF NOT EXISTS incident_timelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    actor VARCHAR(100) DEFAULT 'SYSTEM', -- e.g., 'AI_COPILOT', 'USER', 'SYSTEM'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_time ON incident_timelines(incident_id, timestamp ASC);

-- ==========================================
-- PHASE 14: Global Intelligence & Research
-- ==========================================

-- Federated Data Sources
CREATE TABLE IF NOT EXISTS federated_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(100) NOT NULL, -- e.g., 'API', 'DATABASE', 'RESEARCH_HUB'
    connection_config JSONB,
    health_status VARCHAR(50) DEFAULT 'UNKNOWN',
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datasets Catalog (Climate / ML / Research)
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_id UUID REFERENCES federated_sources(id) ON DELETE SET NULL,
    time_range_start TIMESTAMP WITH TIME ZONE,
    time_range_end TIMESTAMP WITH TIME ZONE,
    license VARCHAR(100),
    quality_score DECIMAL(5,2),
    is_synthetic BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Research Workspace (Experiments & Reproducibility)
CREATE TABLE IF NOT EXISTS experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    hypothesis TEXT,
    methodology JSONB,
    results JSONB,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Privacy & Sharing Policies
CREATE TABLE IF NOT EXISTS privacy_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type VARCHAR(100) NOT NULL, -- e.g., 'DATASET', 'TWIN', 'REPORT'
    resource_id UUID NOT NULL,
    owner_organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    visibility VARCHAR(50) DEFAULT 'PRIVATE', -- PRIVATE, ORGANIZATION, PUBLIC
    aggregation_rules JSONB, -- Defines how data must be obfuscated when shared
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
