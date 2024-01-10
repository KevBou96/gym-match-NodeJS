
const { validationResult } = require('express-validator');
const Auth = require('../models/auth');
const Users = require('../models/users')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../enviroment/enviroment-dev')

exports.postSignUp = async (req, res, next) => {
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
    try {
        const responseData = await Auth.getEmail(email);
        if (responseData) {
            const error = new Error('Email already exists');
            error.statusCode = 422;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = {
            firstName,
            lastName,
            email,
            hashedPassword
        };
        const resData = await Auth.saveUser(user);
        const singUpToken = jwt.sign({
            email: user.email,
            user_id: resData.user_id
        }, secret, 
        { expiresIn: '1h'});
        await  Auth.signUpEmail(user.email, singUpToken);
        return res.status(201).json({
            message: 'User created, please verify email address',
        })
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
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

exports.verifyEmail = async (req, res, next) => {
    const email = req.email;
    try {
        await  Auth.verifyUserEmail(email)
    Auth.verifyUserEmail(email);
    res.status(200).send(`<p>Your Email has been verified, Please visit the following link to login: <a href='http://localhost:4200/login'>Link</a></p>`)
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.forgotPassword = async (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        throw error;
    }
    try {
        const emailData = await Auth.getEmail(email);
        if (!emailData) {
            const error = new Error('Email do not exists');
            error.statusCode = 404;
            throw error
        }
        const token = jwt.sign({
            email: emailData.email
        }, secret
        , {expiresIn: '1h'})
        await Auth.resetPasswordEmail(email, token);
        res.status(200).json({
            message: 'success'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getResetPassword = (req, res, next) => {
    const email = req.email;
    res.status(200).json({
        message: 'success',
        email: email
    })
}

exports.postResetPassword = async (req, res, next) => {
    const email = req.email;
    const newPassword = req.body.password;
    try {
        const emailRes = await Auth.getEmail(email);
        if (!emailRes) {
            const error = new Error('An unknown error occurred');
            error.statusCode = 404;
            throw error
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 12)
        await Auth.resetPassword(email, newHashedPassword);
        res.status(201).json({
            message: 'Password has been changed'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.verifyUserAuth = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user_data = await Users.getUserInfo(userId);
        if (!user_data) {
            const error = new Error('User do not exists');
            error.statusCode = 404;
            throw error
        }
        const user = {
            userId: user_data.user_id,
            firstName: user_data.first_name,
            lastName: user_data.last_name,
            email: user_data.email,
            created_on: user_data.created_on
        }
        res.status(200).json({
            user
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}