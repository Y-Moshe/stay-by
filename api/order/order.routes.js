const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const controller = require('./order.controller')
const router = express.Router()

router.get('/renter', requireAuth, controller.getRenterOrders)

router.get('/host', requireAuth, controller.getHostOrders)

router.get('/:id', controller.getOrderById)

router.post('/', requireAuth, controller.addOrder)

router.put('/:id', requireAuth, controller.updateOrder)

module.exports = router