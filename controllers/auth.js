
const { validationResult } = require('express-validator');
const Auth = require('../models/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../enviroment/enviroment-dev')

exports.postSignUp = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw error;
    }
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    Auth.getEmail(email)
        .then(responseData => {
            if (responseData) {
                const error = new Error('Email already exists');
                error.statusCode = 422;
                throw error;
            }
            bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = {
                        firstName,
                        lastName,
                        email,
                        hashedPassword
                    };
                    Auth.saveUser(user)
                        .then(resData => {
                            console.log(resData);
                            return res.status(201).json({
                                message: 'User created',
                                userId: resData.user_id
                            })
                        }).catch(err => {
                            if (!err.statusCode) {
                            err.statusCode = 500;
                            }
                            next(err);
                        })
                    })
                .catch(err => {
                    if (!err.statusCode) {
                        err.statusCode = 500;
                    }
                    next(err);
                })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
    
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw error;
    }
    Auth.loginUser(email)
        .then(responseData => {
            if (responseData) {
                bcrypt.compare(password, responseData.password)
                    .then(doMatch => {
                        if (doMatch) {
                            if (responseData.verified) {
                                const token = jwt.sign({
                                    email: responseData.email,
                                    userId: responseData.user_id,
                                }, secret,
                                { expiresIn: '1h'}
                                );
                                return res.status(200).json({
                                    message: 'login success',
                                    token: token,
                                })
                            }
                            const error = new Error('Please verify email');
                            error.statusCode = 401;
                            throw error;
                        }
                        const error = new Error('Wrong password');
                        error.statusCode = 401;
                        throw error;
                    }).catch(err => {
                        if (!err.statusCode) {
                            err.statusCode = 500;
                        }
                        next(err);
                    })
            } else {
                const error = new Error('User does not exists');
                error.statusCode = 404;
                throw error
            }
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}