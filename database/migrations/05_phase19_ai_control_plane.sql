-- PHASE 19 AI CONTROL PLANE MIGRATION

CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50) NOT NULL,
    capabilities JSONB,
    allowed_tools JSONB,
    required_permissions JSONB,
    input_schema JSONB,
    output_schema JSONB,
    model_config JSONB,
    timeout INTEGER DEFAULT 30000,
    max_iterations INTEGER DEFAULT 5,
    risk_class VARCHAR(50) DEFAULT 'MODERATE',
    approval_policy VARCHAR(50) DEFAULT 'REQUIRED',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    input_schema JSONB,
    output_schema JSONB,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    required_permissions JSONB,
    read_only BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    tenant_scoped BOOLEAN DEFAULT TRUE,
    audit_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    rules JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_pol_org ON ai_policies(organization_id);

CREATE TABLE IF NOT EXISTS ai_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    task TEXT NOT NULL,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    objective TEXT,
    input_context JSONB,
    recommendation JSONB,
    alternatives JSONB,
    risk_level VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ai_uncertainty_passports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES ai_decisions(id) ON DELETE CASCADE,
    confidence VARCHAR(50), -- VERY_LOW, LOW, MODERATE, HIGH, VERY_HIGH
    confidence_method VARCHAR(255),
    uncertainty_level VARCHAR(50),
    uncertainty_sources JSONB,
    evidence_quality VARCHAR(50),
    evidence_count INTEGER DEFAULT 0,
    data_freshness INTEGER, -- Seconds
    model_agreement VARCHAR(50),
    verification_sources JSONB,
    assumptions JSONB,
    limitations JSONB,
    provenance JSONB,
    recommended_next_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES ai_decisions(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- SECOND_SOURCE, HISTORICAL_ANALOG, FORECAST_COMPARISON, RULE_VALIDATION
    result JSONB NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decision_id UUID REFERENCES ai_decisions(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL, -- RECOMMENDATION, CONFIDENCE, EVIDENCE
    agents_involved JSONB,
    resolution_status VARCHAR(50) DEFAULT 'UNRESOLVED',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    decision_id UUID REFERENCES ai_decisions(id) ON DELETE CASCADE,
    recommendation JSONB NOT NULL,
    risk_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EXPIRED, CANCELLED, EXECUTED
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ai_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    memory_type VARCHAR(50) NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    tokens INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    model VARCHAR(100),
    provider VARCHAR(100),
    estimated_cost DECIMAL(10, 6) DEFAULT 0.0,
    task VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    actor UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    tool_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    risk VARCHAR(50),
    result JSONB,
    correlation_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
    test_case VARCHAR(255) NOT NULL,
    accuracy DECIMAL(5, 2),
    groundedness DECIMAL(5, 2),
    tool_correctness DECIMAL(5, 2),
    policy_compliance BOOLEAN,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
