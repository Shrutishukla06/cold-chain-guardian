import StatusBadge from '../StatusBadge.jsx'
import { SENSOR_CATALOG, SENSOR_IDS } from '../../data/shipmentData.js'
import { SENSOR_ICONS } from './sensorIcons.jsx'

const isNumber = (value) => value !== '' && value != null && Number.isFinite(Number(value))

function configStatus(available, enabled, configured) {
  if (!available) return { label: 'Sensor unavailable', tone: 'muted' }
  if (!enabled) return { label: 'Not monitored', tone: 'muted' }
  if (!configured) return { label: 'Needs configuration', tone: 'warn' }
  return { label: 'Configured', tone: 'ok' }
}

/**
 * Section C — for every sensor type show:
 *   1. whether the sensor is available on the selected device, and
 *   2. whether a monitoring range has been configured by the shipper.
 * These are deliberately separate states.
 */
function MonitoringRequirements({ monitoring, device, onChange }) {
  return (
    <div className="monitoring-grid">
      {SENSOR_IDS.map((sensorId) => {
        const meta = SENSOR_CATALOG[sensorId]
        const config = monitoring[sensorId]
        const Icon = SENSOR_ICONS[sensorId]
        const available = Boolean(device?.sensors?.includes(sensorId))
        const isState = meta.kind === 'state'

        const configured = isState
          ? Boolean(config.acceptableState)
          : isNumber(config.acceptable.min) && isNumber(config.acceptable.max)
        const status = configStatus(available, config.enabled, configured)

        return (
          <article
            key={sensorId}
            className={`monitoring-card${available ? '' : ' monitoring-card--unavailable'}`}
          >
            <header className="monitoring-card__head">
              <span
                className="monitoring-card__icon"
                style={{ color: meta.color }}
                aria-hidden="true"
              >
                <Icon size={17} />
              </span>
              <div className="monitoring-card__title">
                <h3>{meta.label}</h3>
                <span>{meta.model}</span>
              </div>
              <StatusBadge tone={status.tone} dot>
                {status.label}
              </StatusBadge>
            </header>

            <div className="monitoring-card__availability">
              <span className="monitoring-card__eyebrow">Sensor availability</span>
              <span className={`availability-text availability-text--${available ? 'ok' : 'off'}`}>
                {available
                  ? `Connected on ${device.id}`
                  : device
                    ? `Not connected on ${device.id}`
                    : 'Select a device to check availability'}
              </span>
            </div>

            <div className="monitoring-card__config">
              <span className="monitoring-card__eyebrow">
                Acceptable range (shipper-defined)
              </span>

              {isState ? (
                <label className="monitoring-card__door">
                  <span>Expected state</span>
                  <select
                    className="field__input field__input--compact"
                    value={config.acceptableState}
                    onChange={(event) =>
                      onChange(sensorId, { acceptableState: event.target.value })
                    }
                  >
                    <option value="closed">Closed</option>
                    <option value="open">Open</option>
                  </select>
                </label>
              ) : (
                <div className="range-inputs">
                  <label className="range-inputs__field">
                    <span>Min</span>
                    <input
                      type="number"
                      className="field__input field__input--compact"
                      placeholder="—"
                      step="any"
                      value={config.acceptable.min}
                      onChange={(event) =>
                        onChange(sensorId, {
                          acceptable: {
                            ...config.acceptable,
                            min: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <span className="range-inputs__dash" aria-hidden="true">
                    to
                  </span>
                  <label className="range-inputs__field">
                    <span>Max</span>
                    <input
                      type="number"
                      className="field__input field__input--compact"
                      placeholder="—"
                      step="any"
                      value={config.acceptable.max}
                      onChange={(event) =>
                        onChange(sensorId, {
                          acceptable: {
                            ...config.acceptable,
                            max: event.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <span className="range-inputs__unit">{meta.unit}</span>
                </div>
              )}

              {!configured && config.enabled && (
                <span className="monitoring-card__warning">
                  Enter the limits confirmed by your quality team. No default is
                  assumed.
                </span>
              )}
            </div>

            <label className="monitor-toggle">
              <input
                type="checkbox"
                checked={config.enabled}
                disabled={!available}
                onChange={(event) =>
                  onChange(sensorId, { enabled: event.target.checked })
                }
              />
              <span>Monitor this parameter</span>
              {!available && (
                <span className="monitor-toggle__note">
                  {device ? 'Sensor not fitted' : 'No device selected'}
                </span>
              )}
            </label>
          </article>
        )
      })}
    </div>
  )
}

export default MonitoringRequirements