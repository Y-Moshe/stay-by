const logger = require('./logger.service')

const EVENTS = {
    ORDER_ADD: 'order-add',
    ORDER_STATUS: 'order-status',
    USER_UPDATE: 'user-update',
    CHAT_SET_TOPIC: 'chat-set-topic',
    CHAT_SEND_MSG: 'chat-send-msg',
    SET_USER_SOCKET: 'set-user-socket',
    UNSET_USER_SOCKET: 'unset-user-socket'
}

const EMITS = {
    ORDER_ADDED: 'order-added',
    ORDER_STATUS_CHANGED: 'order-status-changed',
    USER_UPDATED: 'user-updated',
    CHAT_ADD_MSG: 'chat-add-msg'
}

var gIo = null

function setupSocketAPI(http) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })

    gIo.on('connection', socket => {
        logger.info(`New connected socket [id: ${socket.id}]`)
        socket.on('disconnect', socket => {
            logger.info(`Socket disconnected [id: ${socket.id}]`)
        })

        // Join user to some room / topic (chat for example)
        socket.on(EVENTS.CHAT_SET_TOPIC, topic => {
            if (socket.myTopic === topic) return
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
                logger.info(`Socket is leaving topic ${socket.myTopic} [id: ${socket.id}]`)
            }
            socket.join(topic)
            socket.myTopic = topic
        })

        // When new message sent, emits to all sockets in the same room / topic
        socket.on(EVENTS.CHAT_SEND_MSG, msg => {
            logger.info(`New chat msg from socket [id: ${socket.id}], emitting to topic ${socket.myTopic}`)
            gIo.to(socket.myTopic).emit(EMITS.CHAT_ADD_MSG, msg)
        })

        // On first login
        socket.on(EVENTS.SET_USER_SOCKET, userId => {
            logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
            socket.userId = userId
            socket.join(userId)
        })

        // On logout
        socket.on(EVENTS.UNSET_USER_SOCKET, () => {
            logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
            delete socket.userId
        })

        // When new order is sent, notify the host (if connected / his socket(s) exists)
        socket.on(EVENTS.ORDER_ADD, order => {
            const hostId = order.host._id
            gIo.to(hostId).emit(EMITS.ORDER_ADDED, order)
        })

        // When the status of an order is changed, notify the renter (if connected / his socket(s) exists)
        socket.on(EVENTS.ORDER_STATUS, order => {
            const renterId = order.renter._id
            gIo.to(renterId).emit(EMITS.ORDER_STATUS_CHANGED, order)
        })

        // When the user update some of his data, notify all his connected socket(s) for live updates
        // (specifically used for wishlist updates)
        socket.on(EVENTS.USER_UPDATE, user => {
            gIo.to(user._id).emit(EMITS.USER_UPDATED, user)
        })
    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label.toString()).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
    userId = userId.toString()
    const socket = await _getUserSocket(userId)

    if (socket) {
        logger.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
        socket.emit(type, data)
    } else {
        logger.info(`No active socket for user: ${userId}`)
    }
}

// If possible, send to all sockets BUT not the current socket 
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
    userId = userId.toString()

    logger.info(`Broadcasting event: ${type}`)
    const excludedSocket = await _getUserSocket(userId)
    if (room && excludedSocket) {
        logger.info(`Broadcast to room ${room} excluding user: ${userId}`)
        excludedSocket.broadcast.to(room).emit(type, data)
    } else if (excludedSocket) {
        logger.info(`Broadcast to all excluding user: ${userId}`)
        excludedSocket.broadcast.emit(type, data)
    } else if (room) {
        logger.info(`Emit to room: ${room}`)
        gIo.to(room).emit(type, data)
    } else {
        logger.info(`Emit to all`)
        gIo.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets()
    const socket = sockets.find(s => s.userId === userId)
    return socket
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets()
    return sockets
}

module.exports = {
    // set up the sockets service and define the API
    setupSocketAPI,
    // emit to everyone / everyone in a specific room (label)
    emitTo,
    // emit to a specific user (if currently active in system)
    emitToUser,
    // Send to all sockets BUT not the current socket - if found
    // (otherwise broadcast to a room / to all)
    broadcast
}