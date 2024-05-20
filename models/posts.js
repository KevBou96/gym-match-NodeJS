

const db = require('../util/database');

module.exports = class Posts {


    static createPost(title, content, imgurl, user_id) {
        return db.none('INSERT INTO posts(post_title, post_content, created_data, imgurl, user_id) VALUES($1, $2, $3, $4, $5)',[title, content, new Date(), imgurl, user_id]);
    }

    // static getAllPosts() {
    //     return db.manyOrNone('SELECT p.post_id, p.post_title, p.created_data, p.likes, p.dislikes, p.user_id, u.first_name, u.last_name FROM posts p INNER JOIN users u ON p.user_id = u.user_id ORDER BY created_data DESC');
    // }

    static getAllPosts(user_id) {;
        return db.tx(t => {
            const getPosts = t.any('SELECT p.post_id, p.post_title, p.created_data, p.likes, p.dislikes, p.user_id, u.first_name, u.last_name FROM posts p INNER JOIN users u ON p.user_id = u.user_id ORDER BY created_data DESC');
            const getPostsLikedByUser = t.any('SELECT feedback_id, post_id from likes where user_id = $1', user_id);
            const getPostsDislikedByUser = t.any('SELECT dislike_id, post_id from dislikes where user_id = $1', user_id);
            return t.batch([getPosts, getPostsLikedByUser, getPostsDislikedByUser]);
        })
        
    }

    static getPost(post_id, user_id) {
        return db.oneOrNone('SELECT * FROM posts WHERE post_id = $1 AND user_id = $2', [post_id, user_id])
    }

    static deletePost(post_id, user_id) {
        return db.oneOrNone('DELETE FROM posts WHERE post_id = $1 AND user_id = $2 RETURNING *', [post_id, user_id])
    }

    static getUserPosts(user_id) {
        return db.manyOrNone('SELECT p.post_id, p.post_title, p.created_data, u.first_name, u.last_name FROM posts p INNER JOIN users u ON p.user_id = u.user_id WHERE u.user_id = $1 ORDER BY created_data DESC',
        [user_id]);
    }

    static likePost(post_id, user_id) {
        return db.tx(t => {
            const increaseLikeCount = t.oneOrNone('UPDATE posts SET likes = likes + 1 WHERE post_id = $1 returning likes', [post_id]);
            const createUserLike = t.none('INSERT INTO likes(post_id, user_id) values($1, $2)', [post_id, user_id]);
            return t.batch([increaseLikeCount, createUserLike])
        })
    }

    static unLikePost(post_id, user_id) {
        return db.tx(t => {
            const decreaseLikeCount = t.oneOrNone('UPDATE posts SET likes = likes - 1 WHERE post_id = $1 returning likes', [post_id]);
            const deleteUserLike = t.none('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [post_id, user_id]);
            return t.batch([decreaseLikeCount, deleteUserLike])
        })
    }

    static dislikePost(post_id, user_id) {
        return db.tx(t => {
            const increaseDislikeCount = t.oneOrNone('UPDATE posts SET dislikes = dislikes + 1 WHERE post_id = $1 returning dislikes', [post_id]);
            const createUserDislike = t.none('INSERT INTO dislikes(post_id, user_id) values($1, $2)', [post_id, user_id]);
            return t.batch([increaseDislikeCount, createUserDislike])
        })
    }

    static unDislikePost(post_id, user_id) {
        return db.tx(t => {
            const decreaseDislikeCount = t.oneOrNone('UPDATE posts SET dislikes = dislikes - 1 WHERE post_id = $1 returning dislikes', [post_id]);
            const deleteUserDislike = t.none('DELETE FROM dislikes WHERE post_id = $1 AND user_id = $2', [post_id, user_id]);
            return t.batch([decreaseDislikeCount, deleteUserDislike])
        })
    }

    static checkDislike(post_id, user_id) {
        return db.oneOrNone('INSERT INTO dislikes(post_id, user_id) values($1, $2) on conflict (post_id, user_id) do nothing RETURNING dislike_id', [post_id, user_id])
    }

    static dislikePost(post_id) {
        return db.oneOrNone('UPDATE posts SET dislikes = dislikes + 1 WHERE post_id = $1 RETURNING dislikes', [post_id])
    }
 }
