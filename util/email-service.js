
const nodemailer = require('nodemailer');
let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'kevbousader@gmail.com',
        pass: 'nhwk jttq kbwn cpzj'
    }
})

module.exports = transport;