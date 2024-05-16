const { ValidationResult, validationResult} = require('express-validator');
const fs = require('fs');
const path = require('path');

const Posts = require('../models/posts');
const Users = require('../models/users');
const { log } = require('console');

const io = require('../util/socket');
const { post } = require('../routes/feed');

exports.getPosts = async (req, res, next) => {
    const verified_user_id = req.userId;
    try {
        let isTrue = false;
        const result = await Posts.getAllPosts(verified_user_id);
        const posts = result[0];
        const posts_liked = result[1];
        if (posts_liked !== undefined || posts_liked.length !== 0) {
            isTrue = modifyPosts(posts, posts_liked)
        }
        console.log(isTrue);
        res.status(200).json({
            posts,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    }
}

exports.getUserPosts = async (req, res, next) => {
    const user_id = req.params.userId;
    try {
        const posts = await Posts.getUserPosts(user_id);
        res.status(200).json({
            message: 'SUCCESS',
            posts: posts
        })
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.postPost = async (req, res, next) => {
    const title = req.body.post_title;
    const content = req.body.post_content;
    const userId = +req.body.user_id;
    const verifiedUserId = req.userId;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {  //if errors
        const error = new Error('Error: Validation Failed');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error
    }
    const imgurl = req.file.path.replace("\\", "/");
    if (userId === verifiedUserId) {
        try {
            await Posts.createPost(title, content, imgurl, verifiedUserId);
            const post = {
                post_title: title,
                post_id: verifiedUserId,
                created_data: new Date(),
                first_name,
                last_name
            }
            io.getIO().emit('posts', { action: 'create', post: post })
            res.status(201).json({
                message: 'Post created succesfully',
            })
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    } else {
        const error = new Error('User is not allowed');
        error.statusCode = 404;
        throw error;
    }
    
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;
    const user_id = req.userId;
    try {
        const post = await Posts.getPost(postId, user_id);
        console.log(post);
        if (!post) {
            const error = new Error('Post does not exists');
            error.statusCode = 404;
            throw error
        }
        res.status(200).json({
            post: post
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;
    const user_id = req.userId;
    try {
        const post = await Posts.deletePost(postId, user_id);
        if (!post) {
            const error = new Error('could not find post to delete');
            error.statusCode = 404;
            throw error
        }
        console.log(post);
        clearImage(post.imgurl)
        res.status(201).json({
            message: 'Post deleted'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500; //server error
        }
        next(err);
    }
}

exports.likePost = async (req, res, next) => {
    const postId = req.body.post_id;
    const userId = req.body.user_id;
    const verifiedUserId = req.userId;
    try {
        const result = await Posts.checkLike(postId, userId);
        if (result) {
            try {
                const likes_count = await Posts.likePost(postId);
                return res.status(201).json({
                    postId: postId,
                    likes: likes_count.likes,
                    message: 'POST_LIKED_SUCCESS'
                })
            } catch (err) {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            }
        } else {
            return res.status(200).json({
                postId: postId,
                message: 'POST_ALREADY_LIKED'
            })
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.dislikePost = async (req, res, next) => {
    const postId = req.body.post_id;
    const userId = req.body.user_id;
    const verifiedUserId = req.userId;
    try {
        const result = await Posts.checkDislike(postId, userId);
        if (result) {
            try {
                const count_dislike = await Posts.dislikePost(postId);
                return res.status(201).json({
                    postId: postId,
                    dislikes: count_dislike.dislikes,
                    message: 'POST_DISLIKE_SUCCESS'
                })
            } catch (err) {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            }
        } else {
            return res.status(200).json({
                postId: postId,
                message: 'POST_ALREADY_DISLIKED'
            })
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}

const modifyPosts = (posts, posts_liked) => {
    let posts_ids = posts.map(post => post.post_id);
    let posts_liked_ids = posts_liked.map(post_liked => post_liked.post_id)
    let isFound =  posts_ids.some(el => posts_liked_ids.includes(el));
    return isFound;
}