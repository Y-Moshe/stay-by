const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const controller = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', controller.getStays)

router.get('/liked', requireAuth, controller.getLikedStays)

router.get('/locations', controller.getStayLocations)

router.get('/listings', requireAuth, controller.getListings)

router.get('/:id', controller.getStayById)

router.post('/', requireAuth, controller.addStay)

router.put('/:id', requireAuth, controller.updateStay)

router.delete('/:id', requireAuth, controller.removeStay)

module.exports = router