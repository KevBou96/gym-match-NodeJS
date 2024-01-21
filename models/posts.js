

const db = require('../util/database');

module.exports = class Posts {


    static createPost(title, content, imgurl, user_id) {
        return db.none('INSERT INTO posts(post_title, post_content, created_data, imgurl, user_id) VALUES($1, $2, $3, $4, $5)',[title, content, new Date(), imgurl, user_id]);
    }

    static getPosts() {
        return db.manyOrNone('SELECT p.post_id, p.post_title, p.created_data, u.first_name, u.last_name FROM posts p INNER JOIN users u ON p.user_id = u.user_id ORDER BY created_data DESC');
    }

    static getPost(post_id, user_id) {
        return db.oneOrNone('SELECT * FROM posts WHERE post_id = $1 AND user_id = $2', [post_id, user_id])
    }

    static deletePost(post_id, user_id) {
        return db.oneOrNone('DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *', [post_id, user_id])
    }
}
