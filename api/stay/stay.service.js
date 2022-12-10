const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId
const _ = require('lodash')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('stay')
        const stays = await collection
            .find(criteria)
            // .skip(+filterBy.skip || 0)
            .limit(100)
            .toArray()

        return stays.map(_mapStay)
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getLikedStays(likedStayIds) {
    try {
        const collection = await dbService.getCollection('stay')
        likedStayIds = likedStayIds.map(id => ObjectId(id))
        const stays = await collection.find({
            _id: { $in: likedStayIds }
        }).toArray()

        return stays.map(_mapStay)
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getListings(hostId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stays = await collection.find({
            'host._id': hostId
        }).toArray()

        return stays.map(_mapStay)
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getStayLocations(querySearch) {
    try {
        const collection = await dbService.getCollection('stay')
        const allStays = await collection.find({}).toArray()

        let allLocs = allStays
            .map(({ address }) => address)
            .map(address => {
                const formattedValue = `${address.city}, ${address.country}`
                return formattedValue
            })

        const filteredLocs = _.uniq(allLocs)

        const regex = new RegExp(querySearch, 'i')
        return filteredLocs.filter(doc => regex.test(doc))
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        const stay = await collection.findOne({ _id: ObjectId(stayId) })
        return _mapStay(stay)
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function remove(stayId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.deleteOne({ _id: ObjectId(stayId) })
        return stayId
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}

async function add(stay) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function update(stayId, stay) {
    try {
        const collection = await dbService.getCollection('stay')
        delete stay._id
        await collection.updateOne({ _id: ObjectId(stayId) }, { $set: stay })
        return stay
    } catch (err) {
        logger.error(`cannot update stay ${stayId}`, err)
        throw err
    }
}

async function addStayMsg(stayId, msg) {
    try {
        msg.id = utilService.makeId()
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

async function removeStayMsg(stayId, msgId) {
    try {
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: ObjectId(stayId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add stay msg ${stayId}`, err)
        throw err
    }
}

function _mapStay(stay) {
    if (!stay) return {}
    return {
        ...stay,
        createdAt: ObjectId(stay._id).getTimestamp()
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.label) {
        const regex = new RegExp(filterBy.label, 'i')
        criteria.labels = { $in: [regex] }
    }

    if (filterBy.city) {
        criteria['address.city'] = { $regex: filterBy.city, $options: 'i' }
    }

    if (filterBy.country) {
        criteria['address.country'] = { $regex: filterBy.country, $options: 'i' }
    }

    return criteria
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addStayMsg,
    removeStayMsg,
    getStayLocations,
    getLikedStays,
    getListings
}
