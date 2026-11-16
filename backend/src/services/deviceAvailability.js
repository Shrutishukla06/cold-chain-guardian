const ApiError = require('../utils/ApiError')
const { Device, Shipment } = require('../models')
const { OPERATIONAL_SHIPMENT_STATUSES } = require('../constants/enums')
const { getDeviceConnectionState } = require('../utils/deviceState')

/** Resolve a business device ID to its document, or return null for no device. */
async function resolveDevice(deviceId) {
  if (deviceId === undefined || deviceId === null) return null

  if (typeof deviceId !== 'string') {
    throw ApiError.badRequest('VALIDATION_ERROR', 'deviceId must be text.', [
      { field: 'deviceId', message: 'deviceId must be text.' },
    ])
  }

  const trimmed = deviceId.trim()
  if (trimmed.length === 0) return null

  const device = await Device.findOne({ deviceId: trimmed })
  if (!device) {
    throw ApiError.notFound(`Device "${trimmed}" was not found.`, [
      { field: 'deviceId', message: 'Device was not found.' },
    ])
  }

  return device
}

/**
 * A device may back at most one operational shipment. The database-level
 * unique index is added with the assignment endpoints later; this check keeps
 * create/update/schedule honest in the meantime.
 */
async function assertDeviceAvailable(device, options = {}) {
  const filter = {
    device: device._id,
    status: { $in: OPERATIONAL_SHIPMENT_STATUSES },
  }

  if (options.excludeShipmentId) {
    filter._id = { $ne: options.excludeShipmentId }
  }

  const conflict = await Shipment.findOne(filter)
    .select('shipmentId status')
    .lean()

  if (conflict) {
    throw ApiError.conflict(
      'DEVICE_BUSY',
      `Device ${device.deviceId} is already assigned to ${conflict.shipmentId}.`,
      [
        {
          field: 'deviceId',
          message: `Operational shipment ${conflict.shipmentId} currently reserves this device.`,
        },
      ],
    )
  }

  const connectionState = getDeviceConnectionState(device)

  if (options.requireOnline && connectionState !== 'online') {
    throw ApiError.conflict(
      'DEVICE_NOT_AVAILABLE',
      `Device ${device.deviceId} is ${connectionState} and cannot be scheduled.`,
      [
        {
          field: 'deviceId',
          message: 'Scheduling requires an online device with a fresh heartbeat.',
        },
      ],
    )
  }

  return connectionState
}

module.exports = {
  resolveDevice,
  assertDeviceAvailable,
}
