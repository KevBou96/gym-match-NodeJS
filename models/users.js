const db = require('../util/database');

module.exports = class Users {


    static getUserInfo (user_id) {
        return db.oneOrNone('SELECT user_id, first_name, last_name, email, created_on FROM users WHERE user_id = $1', [user_id])
    }

    static searchUsers(searchText, userId) {
        return db.manyOrNone(
            'SELECT user_id, first_name, last_name FROM users WHERE (first_name like $1 OR last_name like $1) AND user_id != $2', 
            [searchText, userId])
    }

    static checkIfAlreadyFriends(user_id, friend_id) {
        return db.oneOrNone(
            'SELECT EXISTS(SELECT 1 FROM friends WHERE user_id = $1 AND friend_id = $2)',
            [user_id, friend_id])
    }

    static addFriend(user_id, friend_id) {
        return db.oneOrNone('INSERT INTO friends(user_id, friend_id, friends_since) VALUES($1, $2, $3) RETURNING *', [user_id, friend_id, new Date()])
    }

    static deleteFriend(user_id, friend_id) {
        return db.oneOrNone(
            'DELETE FROM friends WHERE user_id = $1 AND friend_id = $2',
            [user_id, friend_id]
        )
    }


}