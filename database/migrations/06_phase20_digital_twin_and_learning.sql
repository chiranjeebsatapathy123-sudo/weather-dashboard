-- PHASE 20 DIGITAL TWIN 3.0 & LEARNING PLATFORM MIGRATION

CREATE TABLE IF NOT EXISTS twin_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    snapshot_type VARCHAR(50) DEFAULT 'MANUAL', -- MANUAL, SCHEDULED, EVENT_TRIGGERED, PRE_SIMULATION
    entity_count INTEGER DEFAULT 0,
    weather_state JSONB,
    asset_state JSONB,
    resource_state JSONB,
    route_state JSONB,
    incident_state JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_twin_snapshots_org ON twin_snapshots(organization_id);

CREATE TABLE IF NOT EXISTS counterfactual_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    baseline_snapshot_id UUID REFERENCES twin_snapshots(id) ON DELETE SET NULL,
    scenario_name VARCHAR(255) NOT NULL,
    assumptions JSONB,
    variables JSONB,
    constraints JSONB,
    outputs JSONB,
    uncertainty VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS autonomous_monitoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- WEATHER_CHANGE, RISK_CHANGE, ASSET_CHANGE, etc.
    conditions JSONB NOT NULL,
    notification_policy JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prediction_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    prediction JSONB NOT NULL,
    forecast_version VARCHAR(100),
    agent_version VARCHAR(100),
    model_version VARCHAR(100),
    confidence VARCHAR(50),
    evidence JSONB,
    decision_id UUID REFERENCES ai_decisions(id) ON DELETE SET NULL,
    outcome JSONB,
    error_metrics JSONB,
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    owner UUID REFERENCES users(id) ON DELETE SET NULL,
    purpose TEXT,
    training_data_reference TEXT,
    evaluation_results JSONB,
    deployment_status VARCHAR(50) DEFAULT 'EXPERIMENTAL', -- EXPERIMENTAL, VALIDATED, STAGING, PRODUCTION, RETIRED
    risk_class VARCHAR(50) DEFAULT 'MODERATE',
    limitations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enterprise_playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(100),
    checks JSONB,
    information_gathering JSONB,
    recommendations JSONB,
    approval_requirements JSONB,
    communication_steps JSONB,
    recovery_steps JSONB,
    status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, REVIEW, APPROVED, ACTIVE, RETIRED
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plugin_manifests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL,
    permissions JSONB,
    tools JSONB,
    events JSONB,
    security_level VARCHAR(50) DEFAULT 'STANDARD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_quality_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset VARCHAR(255) NOT NULL,
    issue_type VARCHAR(100) NOT NULL, -- MISSING_VALUE, DUPLICATE, STALE_DATA, OUTLIER
    severity VARCHAR(50) DEFAULT 'MODERATE',
    details JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
