const { ValidationResult, validationResult} = require('express-validator');
const Users = require('../models/users');

exports.searchFriends = async (req, res, next) => {
    let searchTx = req.params.searchText;
    console.log(searchTx);
    modifiedSearchTx = '%' + searchTx;
    modifiedSearchTx += '%'
    try {
        const users = await Users.searchUsers(modifiedSearchTx);
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