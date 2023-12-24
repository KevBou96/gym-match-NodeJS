const jwt = require('jsonwebtoken');
const secret = require('../enviroment/enviroment-dev')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not unthenticated.');
        error.statusCode = 401;
        throw error
    }
    const token = req.get('Authorization').split(' ')[1];
    let decodeToken;
    try {
        decodeToken = jwt.verify(token, secret)
    } catch(err) {
        err.statusCode = 500;
        throw err
    }
    if (!decodeToken) {
        const error = new Error('Not unthenticated.');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodeToken.userId;
    next();
}