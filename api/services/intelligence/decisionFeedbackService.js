/**
 * Decision Feedback Service
 * Closes the loop: Prediction -> Decision -> Actual Outcome -> Evaluation
 */
const { executeQuery } = require('../../db/database');

class DecisionFeedbackService {
    async recordOutcome(decisionRecordId, userId, actualOutcome, evaluationText) {
        return await executeQuery(async (db) => {
            const res = await db`
                INSERT INTO decision_outcomes (
                    decision_record_id, actual_outcome, evaluation, recorded_by
                ) VALUES (
                    ${decisionRecordId}, ${JSON.stringify(actualOutcome)}, ${evaluationText}, ${userId}
                ) RETURNING *
            `;
            return res[0];
        });
    }

    async evaluateDecisionLoop(decisionRecordId) {
        const record = await executeQuery(async (db) => {
            const res = await db`
                SELECT r.*, o.actual_outcome, o.evaluation, 
                       c.title as context_title, opt.description as option_description
                FROM decision_records r
                JOIN decision_outcomes o ON o.decision_record_id = r.id
                JOIN decision_contexts c ON c.id = r.context_id
                JOIN decision_options opt ON opt.id = r.selected_option_id
                WHERE r.id = ${decisionRecordId}
            `;
            return res[0];
        });

        if (!record) return null;

        // Perform analysis on accuracy of expected impact vs actual outcome
        // Do NOT automatically retrain models. Just store validated outcomes.
        return {
            context: record.context_title,
            decision: record.option_description,
            expected: record.expected_impact,
            actual: record.actual_outcome,
            evaluation: record.evaluation,
            loopStatus: "CLOSED_AND_LOGGED"
        };
    }
}

module.exports = new DecisionFeedbackService();
