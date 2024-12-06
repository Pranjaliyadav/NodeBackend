const express = require('express')
const {body} = require('express-validator')

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/is-auth')
const router = express.Router()

//get feed posts
router.get('/posts',isAuth, feedController.getPosts)

//create feed post
router.post('/create-post', isAuth,
    [
        body('title')
        .trim()
        .isLength({min : 5}),
        body('content')
        .trim()
        .isLength({min : 5})
    ],

    feedController.createPost)

//get single post
router.get('/post/:postId',isAuth, feedController.getSinglePost)

router.put('/post/:postId',isAuth, [
    body('title')
    .trim()
    .isLength({min : 5}),
    body('content')
    .trim()
    .isLength({min : 5})
], feedController.editPost)

router.delete('/post/:postId',isAuth, feedController.deletePost)
    
module.exports = router