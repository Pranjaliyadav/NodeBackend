const {validationResult} = require('express-validator')
const PostModel = require('../models/post')


exports.getPosts = (req, res, next) =>{
    //will send json response
    res.status(200).json({
        posts : [{ 
            _id : '1',
            title : 'First Post',
             content : 'nothing!', 
             imagUrl :'images/pic.png' ,
            creator : {
                name : 'Pranjali'
            },
            createdAt : new Date()
            }],
       
    })
}

exports.createPost = (req, res, next) =>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res
        .status(422)
        .json({
            message : 'Validation failed, entered data is incorrect!',
            errors : errors.array()
        })
    }

    const title = req.body.title
    const content = req.body.content
    const newPost = new PostModel({
        title, 
        content,
        imageUrl : 'images/pic.png',
        creator : {name : 'Pranjali'},
    })

    newPost
    .save()
    .then(
        result =>{
            console.log("new post result", result)
            res.status(201).json({
                message : 'Post created successfully',
                post : result
            })
        }
    )
    .catch(err =>{
        console.log(err)
    })


   
}