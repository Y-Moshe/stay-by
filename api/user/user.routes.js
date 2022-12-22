const express = require('express')
const { requireAuth } = require('../../middlewares/requireAuth.middleware')
const { getUser, updateUser } = require('./user.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/:id', getUser)

router.put('/:id', requireAuth, updateUser)

module.exports = router