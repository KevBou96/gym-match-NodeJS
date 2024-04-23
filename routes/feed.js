const express = require('express');
const { body } = require('express-validator')
const feedController = require('../controllers/feed')
const router = express.Router();
const isAuth = require('../middleware/is-auth');


router.get('/posts', isAuth.verifyUser, feedController.getPosts);

router.get('/posts/:userId', isAuth.verifyUser, feedController.getUserPosts)

router.get('/post/:postId', isAuth.verifyUser, feedController.getPost)

router.post('/post', isAuth.verifyUser,
[
    body('post_title').trim().isLength({ min: 4 }),
    body('post_content').trim()
],
feedController.postPost)

router.delete('/post/:postId', isAuth.verifyUser, feedController.deletePost)

router.post('/post/like', feedController.likePost)

module.exports = router;