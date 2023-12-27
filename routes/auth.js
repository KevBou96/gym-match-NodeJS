const express = require('express');
const { body } = require('express-validator')
const router = express.Router();
const authController = require('../controllers/auth')
const isAuth = require('../middleware/is-auth');

router.post('/signup',[
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').trim().isEmail().normalizeEmail({gmail_remove_dots: false}),
    body('password').trim().isLength({min: 9})
]
, authController.postSignUp)

router.post('/login', [
    body('email').trim().normalizeEmail(),
    body('password').trim().notEmpty()
]
, authController.postLogin)

router.post('/forgot-password', [
    body('email').trim().isEmail().normalizeEmail()
]
, authController.forgotPassword)

router.get('/verify-email/:token', isAuth.verifyEmail, authController.verifyEmail)

module.exports = router;