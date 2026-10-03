-- PHASE 16 OPERATIONS MIGRATION

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    asset_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    installation_date TIMESTAMP WITH TIME ZONE,
    maintenance_interval INTEGER, -- In days
    last_maintenance_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_assets_org ON assets(organization_id);

CREATE TABLE IF NOT EXISTS device_health_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    health_status VARCHAR(50) NOT NULL,
    health_score INTEGER,
    issues JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_device_health_device ON device_health_events(device_id);

CREATE TABLE IF NOT EXISTS sensor_calibrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    measurement_type VARCHAR(50) NOT NULL,
    offset_val DECIMAL(10,4) DEFAULT 0,
    scale_val DECIMAL(10,4) DEFAULT 1,
    calibrated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    calibration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_calibration_date TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS edge_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'OFFLINE',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS offline_operations (
    operation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    client_version VARCHAR(50),
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    sync_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_work_orders_org ON work_orders(organization_id);

CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    context JSONB NOT NULL,
    decision VARCHAR(50) DEFAULT 'PENDING',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS workflow_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'DRAFT',
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    intent VARCHAR(255) NOT NULL,
    tools_used JSONB,
    input_context JSONB,
    evidence JSONB,
    decision TEXT,
    confidence VARCHAR(50),
    approval_required BOOLEAN DEFAULT FALSE,
    actions JSONB,
    result JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    config JSONB,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    health_status VARCHAR(50) DEFAULT 'UNKNOWN',
    last_successful_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
