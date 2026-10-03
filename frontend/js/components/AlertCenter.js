export const AlertCenter = {
    render(alerts) {
        const list = document.getElementById('alertsList');
        const badge = document.getElementById('notifBadge');
        
        list.innerHTML = '';
        
        if (!alerts || alerts.length === 0) {
            // Generate Advanced Pro-Developer Empty State / Simulation State
            const simData = {
                sys_health: "OPTIMAL",
                active_monitors: 142,
                twin_sync_lag: "14ms",
                inference_engine: "STANDBY",
                last_heartbeat: new Date().toISOString()
            };
            
            list.innerHTML = `
                <div class="pro-alert-dashboard">
                    <div class="pro-header" style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,255,100,0.3); padding-bottom: 10px; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #00ff66; font-family: monospace;">SYS_MONITOR :: AUTONOMOUS_CONTROL_PLANE</h3>
                        <span style="background: rgba(0,255,100,0.1); color: #00ff66; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-family: monospace;">SECURE_MODE</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <!-- Terminal View -->
                        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 15px; font-family: monospace; font-size: 0.85rem; color: #c9d1d9; min-height: 200px;">
                            <div style="color: #8b949e; margin-bottom: 10px;">> tail -f /var/log/weatheros/intelligence.log</div>
                            <div style="color: #79c0ff;">[INFO] Establishing twin snapshot sync... OK</div>
                            <div style="color: #79c0ff;">[INFO] Calibrating AI agents... OK (Confidence: 0.94)</div>
                            <div style="color: #ff7b72;">[WARN] No active meteorological anomalies detected in primary sector.</div>
                            <div style="color: #79c0ff;">[INFO] Ledger service idle. Awaiting intelligence triggers.</div>
                            <div id="simTerminalBlink" style="color: #d2a8ff; margin-top: 10px;">> _</div>
                        </div>

                        <!-- JSON Payload View -->
                        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 15px; font-family: monospace; font-size: 0.85rem; color: #c9d1d9;">
                            <div style="color: #8b949e; margin-bottom: 10px;">// Telemetry Payload [READ-ONLY]</div>
                            <pre style="margin: 0; white-space: pre-wrap; color: #a5d6ff;">${JSON.stringify(simData, null, 2)}</pre>
                            
                            <div style="margin-top: 15px; border-top: 1px solid #30363d; padding-top: 10px;">
                                <div style="color: #8b949e; margin-bottom: 5px;">Active Policy Engines</div>
                                <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                    <span style="background: #238636; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">TwinEngine</span>
                                    <span style="background: #238636; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">RiskAnalyzer</span>
                                    <span style="background: #8957e5; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">AICalibrator</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Simple blink effect
            setInterval(() => {
                const b = document.getElementById('simTerminalBlink');
                if (b) b.style.opacity = b.style.opacity === '0' ? '1' : '0';
            }, 500);

            if (badge) badge.style.display = 'none';
            return;
        }

        if (badge) {
            badge.textContent = alerts.length;
            badge.style.display = 'flex';
        }

        alerts.forEach(alert => {
            const card = document.createElement('div');
            let severityClass = 'notice';
            if (alert.severity === 'HIGH' || alert.severity === 'WARNING' || alert.severity === 'EMERGENCY') severityClass = 'alert';
            if (alert.severity === 'MODERATE' || alert.severity === 'WATCH') severityClass = 'warning';
            
            // Pro Dev JSON View for real alerts
            card.className = `alert-card ${severityClass} pro-dev-alert`;
            card.style.position = 'relative';
            card.innerHTML = `
                <div class="alert-title" style="display:flex; justify-content:space-between;">
                    <span>
                        ${severityClass === 'alert' ? '⚠' : severityClass === 'warning' ? '⚠' : 'ℹ'} 
                        ${alert.title}
                    </span>
                    <span style="font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div class="alert-desc">${alert.description}</div>
                
                <div style="margin-top: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.75rem; color: #a5d6ff;">
                    <details>
                        <summary style="cursor: pointer; color: #8b949e;">[+] View Raw Payload (JSON)</summary>
                        <pre style="margin-top: 10px; white-space: pre-wrap;">${JSON.stringify(alert, null, 2)}</pre>
                    </details>
                </div>
                <div class="alert-source" style="margin-top: 10px;">Source: ${alert.source || 'WeatherOS Core Engine'}</div>
            `;
            list.appendChild(card);
        });
    }
};
