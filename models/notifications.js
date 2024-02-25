const db = require('../util/database');

module.exports = class Notifications {

    static newFriendAlert(user_id, type) {
        let noti_type = "";
        if (type === 'NEW_FRIEND') {
            noti_type = "new friend"
        }
        return db.oneOrNone('INSERT INTO notifications(type, show, user_id) VALUES($1, true, $2) RETURNING *',
        [noti_type, user_id])
    }
}