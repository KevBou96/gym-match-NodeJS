const path = require('path')
const express = require('express');
const bodyParser = require('body-parser')
const helmet = require('helmet')

const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');


const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user')
const { Server } = require('socket.io');


const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + '-' + file.originalname)
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(helmet())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     parameterLimit: 100000,     limit: '50mb',     extended: true   }))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-type, Accept, Authorization"
    );
    next();
  });

app.use((req, res, next) => {
    return res.status(200).json({
        text: 'app is working fine'
    })
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({
        message: message
    })
})

const httpServer = app.listen(8080);
const io = require('./util/socket').init(httpServer)
io.on('connection', socket => {
    console.log('Client connected');
    socket.emit('msg', {
        message: 'Hello', id: socket.id
    })
})