const { sendData, sendList } = require('../utils/apiResponse')
const {
  createShipment,
  listShipments,
  getShipmentDetail,
} = require('../services/shipmentService')
const {
  updateShipment,
  replaceMonitoring,
  scheduleShipment,
  departShipment,
  completeShipment,
  archiveShipment,
} = require('../services/shipmentLifecycleService')

async function create(req, res) {
  const shipment = await createShipment(req.body)

  const detail = await getShipmentDetail(shipment.shipmentId)
  res.set('Location', `/api/shipments/${encodeURIComponent(shipment.shipmentId)}`)

  return sendData(res, detail, 201)
}

async function list(req, res) {
  const { items, meta } = await listShipments(req.query)
  return sendList(res, items, meta)
}

async function get(req, res) {
  const detail = await getShipmentDetail(req.params.shipmentId)
  return sendData(res, detail)
}

async function update(req, res) {
  const shipment = await updateShipment(req.params.shipmentId, req.body)
  const detail = await getShipmentDetail(shipment.shipmentId)
  return sendData(res, detail)
}

async function putMonitoring(req, res) {
  const shipment = await replaceMonitoring(req.params.shipmentId, req.body)
  const detail = await getShipmentDetail(shipment.shipmentId)
  return sendData(res, detail)
}

async function schedule(req, res) {
  const shipment = await scheduleShipment(req.params.shipmentId, req.body ?? {})
  const detail = await getShipmentDetail(shipment.shipmentId)
  return sendData(res, detail)
}

async function depart(req, res) {
  const shipment = await departShipment(req.params.shipmentId, req.body ?? {})
  const detail = await getShipmentDetail(shipment.shipmentId)
  return sendData(res, detail)
}

async function complete(req, res) {
  const shipment = await completeShipment(req.params.shipmentId, req.body ?? {})
  const detail = await getShipmentDetail(shipment.shipmentId)
  return sendData(res, detail)
}

async function archive(req, res) {
  const shipment = await archiveShipment(req.params.shipmentId, req.body ?? {})
  const detail = await getShipmentDetail(shipment.shipmentId)
  return sendData(res, detail)
}

module.exports = {
  create,
  list,
  get,
  update,
  putMonitoring,
  schedule,
  depart,
  complete,
  archive,
}
