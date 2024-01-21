const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user')

router.get('/search-friends/:searchText', isAuth.verifyUser, userController.searchFriends)


module.exports = router;