import StatusBadge from '../StatusBadge.jsx'
import { SENSOR_IDS, SENSOR_CATALOG } from '../../data/shipmentData.js'
import { SENSOR_ICONS } from './sensorIcons.jsx'

function ThresholdInput({ label, value, onChange, suffix, placeholder = '—' }) {
  return (
    <label className="threshold-field">
      <span>{label}</span>
      <span className="threshold-field__control">
        <input
          type="number"
          className="field__input field__input--compact"
          step="any"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <span className="threshold-field__suffix">{suffix}</span>}
      </span>
    </label>
  )
}

/**
 * Section E — cargo-specific threshold policies (per enabled parameter)
 * plus clearly separated system/device alert settings.
 */
function AlertConfiguration({ monitoring, systemAlerts, onChange, onSystemChange }) {
  const enabledSensors = SENSOR_IDS.filter((id) => monitoring[id]?.enabled)

  const updateBound = (sensorId, group, key, value) => {
    onChange(sensorId, {
      [group]: { ...monitoring[sensorId][group], [key]: value },
    })
  }

  return (
    <div className="alert-config">
      <div className="notice notice--info">
        <span>
          <strong>Cargo-specific alerts</strong> compare readings against the
          limits you configure here. <strong>System &amp; device alerts</strong>{' '}
          come from the ESP32, its sensors and connectivity — they are not cargo
          thresholds. No values are pre-filled because safe limits depend on the
          product and your validated requirements.
        </span>
      </div>

      <div className="alert-config__group">
        <div className="alert-config__group-head">
          <h3>Cargo-specific alerts</h3>
          <StatusBadge tone="info">Cargo</StatusBadge>
        </div>

        {enabledSensors.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state__title">No monitoring parameters enabled</span>
            <span className="empty-state__hint">
              Enable parameters in section C to configure warning and critical
              thresholds.
            </span>
          </div>
        ) : (
          <div className="alert-policy-grid">
            {enabledSensors.map((sensorId) => {
              const meta = SENSOR_CATALOG[sensorId]
              const config = monitoring[sensorId]
              const Icon = SENSOR_ICONS[sensorId]
              const isState = meta.kind === 'state'

              return (
                <article className="alert-policy" key={sensorId}>
                  <header className="alert-policy__head">
                    <span style={{ color: meta.color }} aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <strong>{meta.label}</strong>
                    <span className="alert-policy__unit">{meta.unit}</span>
                  </header>

                  {isState ? (
                    <div className="alert-policy__fields alert-policy__fields--state">
                      <ThresholdInput
                        label="Warning after open"
                        value={config.warningOpenMinutes}
                        onChange={(value) =>
                          onChange(sensorId, { warningOpenMinutes: value })
                        }
                        suffix="min"
                      />
                      <ThresholdInput
                        label="Critical after open"
                        value={config.criticalOpenMinutes}
                        onChange={(value) =>
                          onChange(sensorId, { criticalOpenMinutes: value })
                        }
                        suffix="min"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="alert-policy__fields">
                        <ThresholdInput
                          label="Warning low"
                          value={config.warning.min}
                          onChange={(value) =>
                            updateBound(sensorId, 'warning', 'min', value)
                          }
                        />
                        <ThresholdInput
                          label="Warning high"
                          value={config.warning.max}
                          onChange={(value) =>
                            updateBound(sensorId, 'warning', 'max', value)
                          }
                        />
                        <ThresholdInput
                          label="Critical low"
                          value={config.critical.min}
                          onChange={(value) =>
                            updateBound(sensorId, 'critical', 'min', value)
                          }
                        />
                        <ThresholdInput
                          label="Critical high"
                          value={config.critical.max}
                          onChange={(value) =>
                            updateBound(sensorId, 'critical', 'max', value)
                          }
                        />
                      </div>
                      <ThresholdInput
                        label="Escalate to critical after"
                        value={config.escalationMinutes}
                        onChange={(value) =>
                          onChange(sensorId, { escalationMinutes: value })
                        }
                        suffix="min"
                      />
                    </>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div className="alert-config__group">
        <div className="alert-config__group-head">
          <h3>System &amp; device alerts</h3>
          <StatusBadge tone="muted">System</StatusBadge>
        </div>
        <p className="alert-config__hint">
          Operational health alerts for the assigned ESP32. These apply to the
          hardware and connection, not the produce.
        </p>

        <div className="system-alert-list">
          <label className="system-alert">
            <input
              type="checkbox"
              checked={systemAlerts.offline.enabled}
              onChange={(event) =>
                onSystemChange('offline', { enabled: event.target.checked })
              }
            />
            <span className="system-alert__label">Device offline</span>
            <span className="system-alert__config">
              alert after
              <input
                type="number"
                min="1"
                step="1"
                className="field__input field__input--compact"
                value={systemAlerts.offline.afterMinutes}
                disabled={!systemAlerts.offline.enabled}
                onChange={(event) =>
                  onSystemChange('offline', { afterMinutes: event.target.value })
                }
              />
              min
            </span>
          </label>

          <label className="system-alert">
            <input
              type="checkbox"
              checked={systemAlerts.battery.enabled}
              onChange={(event) =>
                onSystemChange('battery', { enabled: event.target.checked })
              }
            />
            <span className="system-alert__label">Low device battery</span>
            <span className="system-alert__config">
              alert below
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                className="field__input field__input--compact"
                value={systemAlerts.battery.thresholdPercent}
                disabled={!systemAlerts.battery.enabled}
                onChange={(event) =>
                  onSystemChange('battery', {
                    thresholdPercent: event.target.value,
                  })
                }
              />
              %
            </span>
          </label>

          <label className="system-alert">
            <input
              type="checkbox"
              checked={systemAlerts.sensorFault.enabled}
              onChange={(event) =>
                onSystemChange('sensorFault', { enabled: event.target.checked })
              }
            />
            <span className="system-alert__label">Sensor fault / disconnected</span>
            <span className="system-alert__config">notify when a sensor stops reporting</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default AlertConfiguration