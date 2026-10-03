const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to database...");

        const schemaSql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf-8');
        const phase16Sql = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '02_phase16_operations.sql'), 'utf-8');
        const phase17Sql = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '03_phase17_decision_intelligence.sql'), 'utf-8');
        const phase18Sql = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '04_phase18_optimization.sql'), 'utf-8');
        const phase19Sql = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '05_phase19_ai_control_plane.sql'), 'utf-8');
        const phase20Sql = fs.readFileSync(path.join(__dirname, 'database', 'migrations', '06_phase20_digital_twin_and_learning.sql'), 'utf-8');
        
        console.log("Executing schema.sql...");
        await client.query(schemaSql);
        
        console.log("Executing 02_phase16_operations.sql...");
        await client.query(phase16Sql);
        
        console.log("Executing 03_phase17_decision_intelligence.sql...");
        await client.query(phase17Sql);
        
        console.log("Executing 04_phase18_optimization.sql...");
        await client.query(phase18Sql);
        
        console.log("Executing 05_phase19_ai_control_plane.sql...");
        await client.query(phase19Sql);
        
        console.log("Executing 06_phase20_digital_twin_and_learning.sql...");
        await client.query(phase20Sql);
        
        console.log("All migrations completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

run();
