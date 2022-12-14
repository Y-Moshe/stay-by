const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function getRenterOrders(loggedInUserId) {
    try {
        const collection = await dbService.getCollection('order')
        const orders = await collection
            .find({ 'renter._id': loggedInUserId })
            .toArray()
        return orders
            .map(_mapOrder)
            .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getHostOrders(loggedInUserId) {
    try {
        const collection = await dbService.getCollection('order')
        const orders = await collection
            .find({ 'host._id': loggedInUserId })
            .toArray()
        return orders
            .map(_mapOrder)
            .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = await collection.findOne({ _id: ObjectId(orderId) })
        return _mapOrder(order)
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return _mapOrder(order)
    } catch (err) {
        logger.error('cannot add order', err)
        throw err
    }
}

async function update(orderId, order) {
    try {
        const collection = await dbService.getCollection('order')
        delete order._id
        await collection.updateOne({ _id: ObjectId(orderId) }, { $set: order })
        order._id = orderId
        return order
    } catch (err) {
        logger.error(`cannot update order ${orderId}`, err)
        throw err
    }
}

function _mapOrder(order) {
    if (!order) return null
    return {
        ...order,
        status: Date.now() > +order.endDate ? 'completed' : order.status,
        createdAt: ObjectId(order._id).getTimestamp()
    }
}

module.exports = {
    getRenterOrders,
    getHostOrders,
    getById,
    add,
    update
}