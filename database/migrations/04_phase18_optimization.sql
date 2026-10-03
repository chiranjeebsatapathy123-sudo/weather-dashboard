-- PHASE 18 OPTIMIZATION & RESILIENCE MIGRATION

CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- people, vehicles, equipment, facilities
    name VARCHAR(255) NOT NULL,
    capacity INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, PARTIALLY_AVAILABLE, UNAVAILABLE, MAINTENANCE
    priority INTEGER DEFAULT 1,
    weather_sensitivity JSONB, -- Explicit configuration (e.g., { "wind": "HIGH", "rain": "MODERATE" })
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_resources_org ON resources(organization_id);

CREATE TABLE IF NOT EXISTS resource_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    available_from TIMESTAMP WITH TIME ZONE NOT NULL,
    available_until TIMESTAMP WITH TIME ZONE NOT NULL,
    assigned_capacity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    origin_lat DECIMAL(10, 6) NOT NULL,
    origin_lon DECIMAL(10, 6) NOT NULL,
    destination_lat DECIMAL(10, 6) NOT NULL,
    destination_lon DECIMAL(10, 6) NOT NULL,
    distance_km DECIMAL(10, 2),
    estimated_duration_min INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES route_profiles(id) ON DELETE CASCADE,
    segment_index INTEGER NOT NULL,
    lat DECIMAL(10, 6) NOT NULL,
    lon DECIMAL(10, 6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS optimization_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- SCHEDULING, LOGISTICS, RESOURCE
    status VARCHAR(50) DEFAULT 'QUEUED', -- QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
    objectives JSONB, -- { risk_weight: 0.5, time_weight: 0.3 }
    results JSONB,
    limitations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS resilience_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    baseline_exposure JSONB,
    sensitivity_factors JSONB,
    adaptive_capacity JSONB,
    resilience_score DECIMAL(5,2),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dependency_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- ASSET, RESOURCE, LOCATION
    entity_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dep_nodes_org ON dependency_nodes(organization_id);

CREATE TABLE IF NOT EXISTS dependency_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    source_node_id UUID REFERENCES dependency_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES dependency_nodes(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL, -- POWER, COOLING, LOGISTICS, DATA
    criticality VARCHAR(50) DEFAULT 'MODERATE'
);

CREATE TABLE IF NOT EXISTS continuity_playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(50) NOT NULL, -- HEATWAVE, FLOOD_RISK, etc.
    tasks JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cascade_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    scenario_name VARCHAR(255) NOT NULL,
    trigger_node_id UUID REFERENCES dependency_nodes(id) ON DELETE SET NULL,
    propagation_graph JSONB NOT NULL,
    simulated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
