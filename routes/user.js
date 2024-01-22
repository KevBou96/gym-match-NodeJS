const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user')

router.get('/search-friends/:searchText', isAuth.verifyUser, userController.searchFriends)

router.get('/get-user/:userId', isAuth.verifyUser, userController.getUser)

router.post('/add-friend', isAuth.verifyUser, userController.postAddFriend)

module.exports = router;