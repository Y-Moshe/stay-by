const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const controller = require('./order.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, controller.getOrders)

router.get('/renter', requireAuth, controller.getRenterOrders)

router.get('/host', requireAuth, controller.getHostOrders)

router.get('/:id', controller.getOrderById)

router.post('/', requireAuth, controller.addOrder)

router.put('/:id', requireAuth, controller.updateOrder)

router.delete('/:id', requireAuth, controller.removeOrder)

// router.delete('/:id', requireAuth, requireAdmin, removeOrder)

router.post('/:id/msg', requireAuth, controller.addOrderMsg)

router.delete('/:id/msg/:msgId', requireAuth, controller.removeOrderMsg)

module.exports = router