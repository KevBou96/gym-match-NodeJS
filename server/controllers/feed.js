const { ValidationResult, validationResult} = require('express-validator');
const fs = require('fs');
const path = require('path');

const Posts = require('../models/posts')

exports.getPosts = (req, res, next) => {
    console.log(req.userId);
    const user_id = req.userId;
    Posts.getPosts(user_id).then(posts => {
        res.status(200).json({
            posts: posts
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err)
    })
}

exports.postPost = (req, res, next) => {
    const title = req.body.post_title;
    const content = req.body.post_content;
    const user_id = req.userId;
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
    Posts.createPost(title, content, imgurl, user_id).then((response) => {
        console.log(response);
        res.status(201).json({
            message: 'Post created succesfully',
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    const user_id = req.userId;
    Posts.getPost(postId, user_id).then(post => {
        if (!post) {
            const error = new Error('Post does not exists');
            error.statusCode = 404;
            throw error
        }
        res.status(200).json({
            post: post
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    const user_id = req.userId;
    Posts.deletePost(postId, user_id).then(post => {
        if (!post) {
            const error = new Error('could not find post');
            error.statusCode = 404;
            throw error
        }
        console.log(post);
        clearImage(post.imgurl)
        res.status(201).json({
            message: 'Post deleted'
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500; //server error
        }
        next(err);
    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}