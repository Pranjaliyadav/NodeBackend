const express = require('express')
const {body} = require('express-validator')

const feedController = require('../controllers/feed')

const router = express.Router()

//get feed posts
router.get('/posts', feedController.getPosts)

//create feed post
router.post('/create-post', 
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
router.get('/post/:postId', feedController.getSinglePost)
    
module.exports = router