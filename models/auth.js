
const db = require('../util/database');

module.exports = class Posts {
    static saveUser(user) {
        return db.oneOrNone('INSERT INTO users(first_name, last_name, email, password, created_on, verified) VALUES($1, $2, $3, $4, $5, $6) RETURNING user_id',
        [user.firstName, user.lastName, user.email, user.hashedPassword, new Date(), false])
    }

    static getEmail(email) {
        return db.oneOrNone('SELECT email FROM users WHERE email = $1', [email]);
    }

    static loginUser(email) {
        return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email])
    }
}