const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user')

router.get('/search-users/:searchText', isAuth.verifyUser, userController.searchFriends)

// user
router.get('/user/:userId', isAuth.verifyUser, userController.getUser)

// router.put('/user/:userId', isAuth, userController.updateUser)

// router.delete('/user/:userId', isAuth, userController.deleteUser)

//friend

router.post('/friend/:friendId', isAuth.verifyUser, userController.postFriend)

router.post('/check-if-friends/:friendId', isAuth.verifyUser, userController.postCheckFriends)

router.delete('/friend/:friendId', isAuth.verifyUser, userController.deleteFromFriends)

module.exports = router;