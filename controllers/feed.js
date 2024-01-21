const { ValidationResult, validationResult} = require('express-validator');
const fs = require('fs');
const path = require('path');

const Posts = require('../models/posts');
const Users = require('../models/users');
const { log } = require('console');

const io = require('../util/socket');

exports.getPosts = async (req, res, next) => {
    try {
        const posts = await Posts.getPosts();
        res.status(200).json({
            posts: posts,
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
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

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}