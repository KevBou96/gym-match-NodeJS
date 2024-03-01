const jwt = require('jsonwebtoken');
const secret = require('../enviroment/enviroment-dev')


 authToken = (token) => {
    let decodeToken = token
    try {
        decodeToken = jwt.verify(decodeToken, secret)
    } catch(err) {
        err.statusCode = 500;
        throw err
    }
    if (!decodeToken) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    return decodeToken
 }
    

exports.verifyUser = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error
    }
    let token = authHeader.split(' ')[1];
    const decodeToken = authToken(token)
    req.userId = decodeToken.userId;
    next();
}

exports.verifyEmail = (req, res, next) => {
    const token = req.params.token;
    const decodeToken = authToken(token);
    req.email = decodeToken.email;
    console.log(decodeToken);
    next();   
}

exports.verifyResetPassword = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error
    }
    let token = authHeader.split(' ')[1];
    const decodeToken = authToken(token);
    req.email = decodeToken.email;
    next();
}