const db = require('../util/database');

module.exports = class Users {


    static getUserInfo (user_id) {
        return db.oneOrNone('SELECT user_id, first_name, last_name, email, created_on FROM users WHERE user_id = $1', [user_id])
    }
}