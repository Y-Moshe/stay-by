const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const controller = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, controller.getStays)

router.get('/liked', requireAuth, controller.getLikedStays)

router.get('/locations', controller.getStayLocations)

router.get('/:id', controller.getStayById)

router.post('/', requireAuth, controller.addStay)

router.put('/:id', requireAuth, controller.updateStay)

router.delete('/:id', requireAuth, controller.removeStay)

// router.delete('/:id', requireAuth, requireAdmin, removeStay)

router.post('/:id/msg', requireAuth, controller.addStayMsg)

router.delete('/:id/msg/:msgId', requireAuth, controller.removeStayMsg)

module.exports = router