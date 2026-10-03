-- PHASE 17 DECISION INTELLIGENCE MIGRATION

CREATE TABLE IF NOT EXISTS decision_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_decision_ctx_org ON decision_contexts(organization_id);

CREATE TABLE IF NOT EXISTS decision_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES decision_contexts(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    metric VARCHAR(100),
    value JSONB,
    unit VARCHAR(50),
    quality VARCHAR(50),
    confidence DECIMAL(5,2),
    method VARCHAR(255),
    freshness INTEGER, -- Age in seconds at capture
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES decision_contexts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    conditions JSONB,
    expected_impact TEXT,
    risk_level VARCHAR(50),
    trade_offs JSONB,
    requires_approval BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    context_id UUID REFERENCES decision_contexts(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES decision_options(id) ON DELETE SET NULL,
    decision_maker UUID REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    notes TEXT,
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS decision_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_record_id UUID REFERENCES decision_records(id) ON DELETE CASCADE,
    actual_outcome JSONB NOT NULL,
    evaluation TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- BASELINE, WHAT_IF, STRESS_TEST, CUSTOM
    parameters JSONB NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS twin_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forecast_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    metric VARCHAR(50) NOT NULL,
    agreement_level VARCHAR(50) NOT NULL, -- HIGH, MODERATE, LOW, INSUFFICIENT_DATA
    uncertainty_score DECIMAL(5,2),
    model_data JSONB NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'EXPERIMENTAL', -- EXPERIMENTAL, VALIDATION, APPROVED, DEPLOYED, RETIRED, DEGRADED
    dataset_version VARCHAR(100),
    training_period JSONB,
    evaluation_period JSONB,
    features JSONB,
    metrics JSONB,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS data_drift_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES model_versions(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- DRIFT, NO_DRIFT, INSUFFICIENT_DATA
    feature_name VARCHAR(100),
    baseline_distribution JSONB,
    current_distribution JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
