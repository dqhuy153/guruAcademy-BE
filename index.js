const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
require('dotenv').config()

const authRoutes = require('./routers/auth')
const coursesRoutes = require('./routers/courses')
const reportRoutes = require('./routers/report')
const courseCategoryRoutes = require('./routers/courseCategories')
const chaptersRoutes = require('./routers/chapters')
const lessonsRoutes = require('./routers/lessons')
const notificationsRoutes = require('./routers/notifications')
const topicsRoutes = require('./routers/topics')
const usersRoutes = require('./routers/users')
const utilsRoutes = require('./routers/utils')
const searchRoutes = require('./routers/search')
const testsRoutes = require('./routers/tests')
const attachmentsRoutes = require('./routers/attachments')
const commentsRoutes = require('./routers/comments')
// const feedbackRoutes = require('./routers/feedbacks');
const adminUsersRoutes = require('./routers/admin/users')

//setup
const app = express()
const PORT = process.env.PORT || 5000
const mongodbUri = process.env.MONGODB_URI

// create socket server
const server = http.createServer(app)
const io = require('socket.io')(server)

//middleware
app.use(cors())
app.use(express.json()) //parse json from req's body

//v1 routers
//50 end points in total
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/report', reportRoutes)
app.use('/api/v1', coursesRoutes)
app.use('/api/v1', courseCategoryRoutes)
app.use('/api/v1', chaptersRoutes)
app.use('/api/v1', lessonsRoutes)
app.use('/api/v1', notificationsRoutes)
app.use('/api/v1', topicsRoutes)
app.use('/api/v1', usersRoutes)
app.use('', utilsRoutes)
app.use('/api/v1', searchRoutes)
app.use('/api/v1', testsRoutes)
app.use('/api/v1', attachmentsRoutes)
app.use('/api/v1', commentsRoutes)
// app.use('/api/v1', feedbackRoutes);

app.use('/api/v1/admin', adminUsersRoutes)

//error response
app.use((error, req, res, next) => {
  console.log(error)

  const status = error.statusCode || 500
  const errorMessage = error.message
  const errorData = error.data
    ? error.data
    : { ...error, success: undefined, statusCode: undefined }

  res.status(status).json({
    message: errorMessage,
    data: errorData,
    success: false,
    statusCode: status,
  })
})

const connections = {}
io.on('connection', (socket) => {
  console.log(connections)
  socket.on('join-call', (clientPath) => {
    if (connections[clientPath] === undefined) {
      connections[clientPath] = {}
    }

    connections[clientPath][socket.id] = {}
    connections[clientPath][socket.id].accessTime = new Date()
    console.log(connections[clientPath])
    Object.keys(connections[clientPath]).forEach((userId) => {
      io.to(userId).emit('user-joined', socket.id, connections[clientPath])
    })
  })

  socket.on('signal', (toId, message) => {
    io.to(toId).emit('signal', socket.id, message)
  })

  socket.on('chat-message', (data, sender, clientPath) => {
    data = sanitizeString(data)
    sender = sanitizeString(sender)

    Object.keys(connections[clientPath]).forEach((clientId) => {
      io.to(clientId).emit(
        'chat-message',
        data,
        sender,
        socket.id
      )
    })
  })

  socket.on('disconnect', () => {
    let room = ''
    Object.keys(connections).forEach((clientRoom) => {
      if (!connections[clientRoom][socket.id]) return
      room = clientRoom
      delete connections[clientRoom][socket.id]
    })

    if (Object.keys(connections[room])?.length === 0) {
      delete connections[room]

      return
    }

    Object.keys(connections[room])?.forEach((userId) => {
      io.to(userId).emit('user-left', socket.id)
    })
  })
})

//connect mongoDB
mongoose
  .connect(mongodbUri, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log('Connected mongoDB')
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
  })
  .catch(err => {
    console.log(err)
  })
