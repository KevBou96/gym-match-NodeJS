const { ValidationResult, validationResult} = require('express-validator');
const Users = require('../models/users');

exports.searchFriends = async (req, res, next) => {
    let searchTx = req.params.searchText;
    const userId = req.userId
    console.log(searchTx);
    modifiedSearchTx = '%' + searchTx;
    modifiedSearchTx += '%'
    try {
        const users = await Users.searchUsers(modifiedSearchTx, userId);
    if (!users) {
        const error = new Error('No users exists');
        error.statusCode = 422;
        throw error
    }
    res.status(200).json({
        users: users
    })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;  
        }
        next(err)
    }
    
}

exports.getUser = async (req, res, next) => {
    user_id = req.params.userId;
    try {
        const user = await Users.getUserInfo(user_id);
        if (!user) {
            const error = new Error('User do not exists');
            error.statusCode = 422;
            throw error
        }
        res.status(200).json({
            user: user
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;  
        }
        next(err)
    }  
}

exports.postAddFriend = (req, res, next) => {
    const userId = req.body.userId;
    const friendId = req.body.friendId;
    console.log(friendId, userId);
    res.status(200).json('success')
}