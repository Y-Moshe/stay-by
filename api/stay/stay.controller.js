const stayService = require('./stay.service.js')
const userService = require('../user/user.service')

const logger = require('../../services/logger.service')

async function getStays(req, res) {
  try {
    logger.debug('Getting Stays')
    const filterBy = req.query
    const results = await stayService.query(filterBy)
    res.json(results)
  } catch (err) {
    logger.error('Failed to get stays', err)
    res.status(500).send({ err: 'Failed to get stays' })
  }
}

async function getStayLocations(req, res) {
  try {
    logger.debug('Getting Locations')
    const stays = await stayService.getStayLocations(req.query.q)

    res.json(stays)
  } catch (err) {
    logger.error('Failed to get stays', err)
    res.status(500).send({ err: 'Failed to get stays' })
  }
}

async function getLikedStays(req, res) {
  try {
    logger.debug('Getting liked stays')
    const { loggedinUser } = req
    const { likedStays } = await userService.getById(loggedinUser._id)
    const stays = await stayService.getLikedStays(likedStays)

    res.json(stays)
  } catch (err) {
    logger.error('Failed to get stays', err)
    res.status(500).send({ err: 'Failed to get stays' })
  }
}

async function getListings(req, res) {
  try {
    logger.debug('Getting listings')
    const { loggedinUser } = req
    const stays = await stayService.getListings(loggedinUser._id)

    res.json(stays)
  } catch (err) {
    logger.error('Failed to get stays', err)
    res.status(500).send({ err: 'Failed to get stays' })
  }
}

async function getStayById(req, res) {
  try {
    const stayId = req.params.id
    const stay = await stayService.getById(stayId)
    res.json(stay)
  } catch (err) {
    logger.error('Failed to get stay', err)
    res.status(500).send({ err: 'Failed to get stay' })
  }
}

async function addStay(req, res) {
  const { loggedinUser } = req

  try {
    const stay = req.body
    stay.host = loggedinUser
    const addedStay = await stayService.add(stay)
    res.json(addedStay)
  } catch (err) {
    logger.error('Failed to add stay', err)
    res.status(500).send({ err: 'Failed to add stay' })
  }
}

async function updateStay(req, res) {
  try {
    const { id: stayId } = req.params
    const isOwner = await stayService.isStayOwner(stayId, req.loggedinUser._id)
    if (!isOwner) return res.status(401).send({ err: 'Not Authorized!' })

    const stay = req.body
    const updatedStay = await stayService.update(stayId, stay)
    res.json(updatedStay)
  } catch (err) {
    logger.error('Failed to update stay', err)
    res.status(500).send({ err: 'Failed to update stay' })

  }
}

async function removeStay(req, res) {
  try {
    const { id: stayId } = req.params
    const isOwner = await stayService.isStayOwner(stayId, req.loggedinUser._id)
    if (!isOwner) return res.status(401).send({ err: 'Not Authorized!' })

    const removedId = await stayService.remove(stayId)
    res.send(removedId + ' successfully removed!')
  } catch (err) {
    logger.error('Failed to remove stay', err)
    res.status(500).send({ err: 'Failed to remove stay' })
  }
}

module.exports = {
  getStays,
  getStayById,
  addStay,
  updateStay,
  removeStay,
  getStayLocations,
  getLikedStays,
  getListings
}