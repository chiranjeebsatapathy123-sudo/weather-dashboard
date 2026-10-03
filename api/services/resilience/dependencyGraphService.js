/**
 * Dependency Graph Service
 * Maps relationships between assets and simulates cascading failures.
 */
const { executeQuery } = require('../../db/database');

class DependencyGraphService {
    
    async registerNode(orgId, type, entityId, name) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO dependency_nodes (organization_id, entity_type, entity_id, name)
                VALUES (${orgId}, ${type}, ${entityId}, ${name}) RETURNING *
            `;
            return res[0];
        });
    }

    async registerEdge(orgId, sourceNodeId, targetNodeId, type, criticality) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO dependency_edges (organization_id, source_node_id, target_node_id, dependency_type, criticality)
                VALUES (${orgId}, ${sourceNodeId}, ${targetNodeId}, ${type}, ${criticality}) RETURNING *
            `;
            return res[0];
        });
    }

    async identifySinglePointsOfFailure(orgId) {
        // Factual graph analysis: Identify nodes where out-degree > 1 (one node feeds many)
        // AND in-degree = 0 (no redundant backup)
        // In a real system, this requires recursive graph traversal.
        // We simulate a basic DB join mapping.
        
        return await executeQuery(async (db) => {
            return await db`
                SELECT n.id, n.name, COUNT(e.target_node_id) as downstream_dependencies
                FROM dependency_nodes n
                JOIN dependency_edges e ON e.source_node_id = n.id
                WHERE n.organization_id = ${orgId}
                GROUP BY n.id, n.name
                HAVING COUNT(e.target_node_id) > 1
            `;
        });
    }

    async runCascadeSimulation(orgId, triggerNodeId, scenarioName) {
        // Find immediate downstream dependencies
        const affectedEdges = await executeQuery(async (db) => {
            return await db`
                SELECT e.*, n.name as target_name 
                FROM dependency_edges e
                JOIN dependency_nodes n ON n.id = e.target_node_id
                WHERE e.source_node_id = ${triggerNodeId} AND e.organization_id = ${orgId}
            `;
        });

        const propagationGraph = {
            trigger_node: triggerNodeId,
            simulated_impacts: affectedEdges.map(e => ({
                affected_node_id: e.target_node_id,
                affected_node_name: e.target_name,
                impact: `Loss of ${e.dependency_type}`
            }))
        };

        const res = await executeQuery(async (db) => {
            const r = await db`
                INSERT INTO cascade_simulations (organization_id, scenario_name, trigger_node_id, propagation_graph)
                VALUES (${orgId}, ${scenarioName}, ${triggerNodeId}, ${JSON.stringify(propagationGraph)})
                RETURNING *
            `;
            return r[0];
        });

        return {
            ...res,
            label: "SIMULATED CASCADE",
            disclaimer: "This is a hypothetical cascade simulation based on configured dependency edges."
        };
    }
}

module.exports = new DependencyGraphService();
