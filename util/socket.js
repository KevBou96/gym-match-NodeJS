let io;

module.exports = {
    init: httpServer => {
        const { Server } = require('socket.io');
        io = new Server(httpServer, {
            cors: {
                origin: 'http://localhost:4200',
                methods: ["GET", "POST"]
            }
        })
        return io
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket not initialized')
        }
        return io
    }
}