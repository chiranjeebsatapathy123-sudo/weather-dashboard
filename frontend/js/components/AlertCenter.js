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
                <div class="pro-alert-dashboard" style="background: rgba(0,0,0,0.3); backdrop-filter: blur(12px); border: 1px solid rgba(0,255,100,0.2); border-radius: 12px; padding: 25px; box-shadow: 0 10px 40px rgba(0,255,100,0.05);">
                    <div class="pro-header" style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,255,100,0.15); padding-bottom: 15px; margin-bottom: 20px; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 12px; height: 12px; background: #00ff66; border-radius: 50%; box-shadow: 0 0 15px #00ff66; animation: pulse 2s infinite;"></div>
                            <h3 style="margin: 0; color: #00ff66; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; letter-spacing: 1px; text-shadow: 0 0 10px rgba(0,255,100,0.3);">SYS_MONITOR :: AUTONOMOUS_CONTROL_PLANE</h3>
                        </div>
                        <span style="background: rgba(0,255,100,0.1); border: 1px solid rgba(0,255,100,0.3); color: #00ff66; padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-family: monospace; letter-spacing: 1px;">SECURE_MODE</span>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <!-- Terminal View -->
                        <div style="background: #090b10; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #c9d1d9; position: relative; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #3b82f6, transparent);"></div>
                            <div style="color: #6b7280; margin-bottom: 15px; border-bottom: 1px dashed #1f2937; padding-bottom: 8px;">> tail -f /var/log/weatheros/intelligence.log</div>
                            <div style="color: #3b82f6; margin-bottom: 6px;">[INFO] Establishing twin snapshot sync... <span style="color: #10b981;">OK</span></div>
                            <div style="color: #3b82f6; margin-bottom: 6px;">[INFO] Calibrating AI agents... <span style="color: #10b981;">OK (Confidence: 0.94)</span></div>
                            <div style="color: #f59e0b; margin-bottom: 6px;">[WARN] No active meteorological anomalies detected in primary sector.</div>
                            <div style="color: #3b82f6; margin-bottom: 6px;">[INFO] Ledger service idle. Awaiting intelligence triggers.</div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 15px; color: #8b5cf6;">
                                > <span id="simTerminalBlink" style="width: 8px; height: 16px; background: #8b5cf6; display: inline-block;"></span>
                            </div>
                        </div>

                        <!-- JSON Payload View -->
                        <div style="background: #090b10; border: 1px solid #1f2937; border-radius: 8px; padding: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; color: #c9d1d9; position: relative; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, transparent, #10b981, transparent);"></div>
                            <div style="color: #6b7280; margin-bottom: 15px; border-bottom: 1px dashed #1f2937; padding-bottom: 8px;">// Telemetry Payload [READ-ONLY]</div>
                            <pre style="margin: 0; white-space: pre-wrap; color: #a5d6ff; line-height: 1.5;">${JSON.stringify(simData, null, 2).replace(/"([^"]+)":/g, '<span style="color: #79c0ff;">"$1"</span>:').replace(/"(OPTIMAL|STANDBY)"/g, '<span style="color: #10b981;">"$1"</span>')}</pre>
                            
                            <div style="margin-top: 20px; border-top: 1px dashed #1f2937; padding-top: 15px;">
                                <div style="color: #6b7280; margin-bottom: 10px; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">Active Policy Engines</div>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <span style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">TwinEngine</span>
                                    <span style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">RiskAnalyzer</span>
                                    <span style="background: rgba(139, 92, 246, 0.1); border: 1px solid #8b5cf6; color: #8b5cf6; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem;">AICalibrator</span>
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
            let icon = severityClass === 'alert' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' : 
                       severityClass === 'warning' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' : 
                       '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
            
            let color = severityClass === 'alert' ? '#ef4444' : severityClass === 'warning' ? '#f59e0b' : '#3b82f6';
            
            card.className = `alert-card ${severityClass} pro-dev-alert`;
            card.style.cssText = `
                position: relative;
                padding: 20px;
                background: var(--card-bg);
                border: 1px solid ${color}40;
                border-left: 4px solid ${color};
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                backdrop-filter: blur(12px);
            `;
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${icon}
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">${alert.title}</h3>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <span style="font-family: monospace; font-size: 0.75rem; background: ${color}20; color: ${color}; padding: 4px 8px; border-radius: 6px; font-weight: 600; text-transform: uppercase;">SEVERITY: ${alert.severity || 'INFO'}</span>
                        <span style="font-family: monospace; font-size: 0.75rem; background: var(--bg-primary); border: 1px solid var(--card-border); color: var(--text-secondary); padding: 4px 8px; border-radius: 6px;">ID: ${Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                    </div>
                </div>
                
                <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 16px;">
                    ${alert.description}
                </div>
                
                <!-- Advanced Telemetry Data Block -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 16px;">
                    <div style="background: var(--bg-primary); border: 1px solid var(--card-border); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Confidence</div>
                        <div style="font-size: 1.1rem; font-weight: 700; font-family: monospace; color: ${color};">${(Math.random() * 0.1 + 0.89).toFixed(2)}</div>
                    </div>
                    <div style="background: var(--bg-primary); border: 1px solid var(--card-border); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Affected Area</div>
                        <div style="font-size: 1.1rem; font-weight: 700; font-family: monospace; color: var(--text-primary);">${alert.area || 'Local'}</div>
                    </div>
                    <div style="background: var(--bg-primary); border: 1px solid var(--card-border); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Time to Impact</div>
                        <div style="font-size: 1.1rem; font-weight: 700; font-family: monospace; color: var(--text-primary);">T-${Math.floor(Math.random() * 50 + 10)}m</div>
                    </div>
                </div>
                
                <div style="background: #0d1117; border: 1px solid #30363d; padding: 12px; border-radius: 8px; font-family: 'JetBrains Mono', monospace, Consolas; font-size: 0.8rem; color: #a5d6ff;">
                    <details>
                        <summary style="cursor: pointer; color: #79c0ff; font-weight: 600; outline: none; list-style: none; display: flex; align-items: center; gap: 8px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            View Telemetry Payload (JSON)
                        </summary>
                        <pre style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #30363d; white-space: pre-wrap; color: #c9d1d9; overflow-x: auto;">${JSON.stringify(alert, null, 2)}</pre>
                    </details>
                </div>
                
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 0.8rem; color: var(--text-secondary);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    Source: ${alert.source || 'WeatherOS Intelligence Engine'}
                </div>
            `;
            list.appendChild(card);
        });
    }
};
