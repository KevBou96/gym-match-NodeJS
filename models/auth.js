
const db = require('../util/database');
const transport = require('../util/email-service');

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

    static verifyUserEmail(email) {
        return db.oneOrNone('UPDATE users SET verified = true', [email])
    }

    static signUpEmail(email, token) {
        console.log(token);
        return transport.sendMail({
            from: 'kevbousader@gmail.com',
            to: email,
            subject: 'Email confirmation',
            html: `
            <p>You have successfully register to Gym-Match</p>
            <p>Follow this: <a href="http://localhost:8080/auth/verify-email/${token}">link</a> to confirm your account</p>
            `
        })
    }

    static resetPasswordEmail(email, token) {
        return transport.sendMail({
            from: 'kevbousader@gmail.com',
            to: email,
            subject: 'Reset password',
            html: `
            <p>You have requested a password reset.</p>
            <p>Follow this: <a href="http://localhost:4200/change-password/${token}">link</a> to reset your password</p>
            `
        })
    }

    static resetPassword(email, password) {
        return db.none('UPDATE users SET password = $1 WHERE email = $2', [password, email])
    }
}