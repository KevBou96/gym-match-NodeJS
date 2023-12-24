const express = require('express');
const { body } = require('express-validator')
const feedController = require('../controllers/feed')
const router = express.Router();
const isAuth = require('../middleware/is-auth');


router.get('/posts', isAuth, feedController.getPosts);

router.post('/post', isAuth,
[
    body('post_title').trim().isLength({ min: 4 }),
    body('post_content').trim()
],
feedController.postPost)

router.get('/post/:postId', isAuth, feedController.getPost)

router.delete('/post/:postId', isAuth, feedController.deletePost)

module.exports = router;