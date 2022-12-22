const orderService = require('./order.service.js')
const logger = require('../../services/logger.service')

async function getRenterOrders(req, res) {
  try {
    logger.debug('Getting renter orders')
    const { loggedinUser } = req
    const orders = await orderService.getRenterOrders(loggedinUser._id)
    res.json(orders)
  } catch (err) {
    logger.error('Failed to get orders', err)
    res.status(500).send({ err: 'Failed to get orders' })
  }
}

async function getHostOrders(req, res) {
  try {
    logger.debug('Getting host orders')
    const { loggedinUser } = req
    const orders = await orderService.getHostOrders(loggedinUser._id)
    res.json(orders)
  } catch (err) {
    logger.error('Failed to get orders', err)
    res.status(500).send({ err: 'Failed to get orders' })
  }
}

async function getOrderById(req, res) {
  try {
    const orderId = req.params.id
    const order = await orderService.getById(orderId)
    res.json(order)
  } catch (err) {
    logger.error('Failed to get order', err)
    res.status(500).send({ err: 'Failed to get order' })
  }
}

async function addOrder(req, res) {
  const { loggedinUser } = req

  try {
    const order = req.body
    order.renter = loggedinUser
    const addedOrder = await orderService.add(order)
    res.json(addedOrder)
  } catch (err) {
    logger.error('Failed to add order', err)
    res.status(500).send({ err: 'Failed to add order' })
  }
}


async function updateOrder(req, res) {
  try {
    const { id: orderId } = req.params
    const order = req.body
    const updatedOrder = await orderService.update(orderId, order)
    res.json(updatedOrder)
  } catch (err) {
    logger.error('Failed to update order', err)
    res.status(500).send({ err: 'Failed to update order' })

  }
}

module.exports = {
  getOrderById,
  addOrder,
  updateOrder,
  getRenterOrders,
  getHostOrders
}