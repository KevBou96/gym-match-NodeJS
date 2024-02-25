const { ValidationResult, validationResult} = require('express-validator');
const Users = require('../models/users');
const Notifications = require('../models/notifications');
const { result } = require('../util/database');
const io = require('../util/socket')

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

exports.postFriend = async (req, res, next) => {
    const userId = req.userId;
    const friendId = req.params.friendId;
    try {
        const checkResult = await Users.checkIfAlreadyFriends(userId, friendId);
        const isFriend = checkResult.exists;
        if (isFriend) {
            const error = new Error('Users already friends');
            error.statusCode = 422;
            throw error
        }
        let result = await Users.addFriend(userId, friendId);
        addFriendAlert(userId, 'NEW_FRIEND');
        res.status(201).json({
            message: 'success',
            result
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;  
        }
        next(err)
    }
}

exports.postCheckFriends = async (req, res, next) => {
    const userId = req.userId;
    const friendId = req.params.friendId;
    try {
        const checkResult = await Users.checkIfAlreadyFriends(userId, friendId);
        const isFriend = checkResult.exists;
        if (!isFriend) {
            return res.status(200).json({
                message: 'NOT FRIENDS'
            })
        }
        res.status(200).json({
            message: 'FRIENDS'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;  
        }
        next(err)
    }
}

exports.deleteFromFriends = async (req, res, next) => {
    
    const friendId = req.params.friendId;
    const userId = req.userId;
    try {
        const checkResult = await Users.checkIfAlreadyFriends(userId, friendId);
        const isFriend = checkResult.exists;
        if (!isFriend) {
            const error = new Error('FORBIDDEN');
            error.statusCode = 403;
            throw error
        }
        await Users.deleteFriend(userId, friendId);
        res.status(200).json({
            message: 'REQUEST_SUCCESS'
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;  
        }
        next(err)
    }
}

const addFriendAlert = async (userId, type) => {
    try {
        let result = await Notifications.newFriendAlert(userId, type);
        io.getIO().emit('notification', { action: type, result: result})
    } catch (err) {
        console.log(err, 'here');
    }
}
