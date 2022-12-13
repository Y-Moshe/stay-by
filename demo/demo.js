// On the frontend
{
  methods: {
    async function handleOrderStatus(order, command) {
      order.status = command // approved or rejected

      const newOrder = utilService.deepCopy(order)
      await this.$store.dispatch({ type: 'updateOrder', order: newOrder })
      socketService.emit(SOCKET_EMIT_ORDER_STATUS, newOrder)
    }
  }
}

// On the backend
socket.on('set-user-socket', userId => {
  logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
  socket.userId = userId
  socket.join(userId)
})

socket.on(SOCKET_EVENT_ORDER_STATUS, async order => {
  const renterId = order.renter._id
  // all user browsers, tabs or other devices that are connected
  gIo.to(renterId).emit(SOCKET_EMIT_ORDER_STATUS, order)
})

// root-cmp / App.vue
export default {
  created() {
    socketService.on(SOCKET_EVENT_ORDER_ADD, this.notifyHost)
    socketService.on(SOCKET_EVENT_ORDER_STATUS, this.notifyOrderStatus)
  },
  unmounted() {
    socketService.terminate()
  },
  methods: {
    notifyHost({ renter }) {
      ElNotification({
        title: 'Reservation',
        message: 'New reservation received from ' + renter.fullname,
        type: 'info'
      })
    },
    notifyOrderStatus({ status, host, stay }) {
      const type = status === 'approved' ? 'success' : 'warning'
      ElNotification({
        title: 'Trip status',
        message: `${host.fullname} ${status} your trip at ${stay.name}`,
        type
      })
    }
  }
}