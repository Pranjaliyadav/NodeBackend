const {validationResult} = require('express-validator')
const PostModel = require('../models/post')


exports.getPosts = (req, res, next) =>{
    PostModel.find()
    .then(posts =>{

        res.status(200).json({
            posts : posts,
            message : 'Fetched posts successfully'
           
        })
    })
    .catch(err =>{
        if(!err.statusCode){
               err.statusCode = 500
              }
              next(err)
           })
    //will send json response
    
}

exports.createPost = (req, res, next) =>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){

       const error = new Error( 'Validation failed, entered data is incorrect!')
       error.statusCode = 422
       throw error
    }
    if(!req.file){
        const error = new Error( 'No image provided!')
        error.statusCode = 422
        throw error
    }
    const imageUrl = req.file.path.replace("\\" ,"/");
    const title = req.body.title
    const content = req.body.content
    const newPost = new PostModel({
        title, 
        content,
        imageUrl :imageUrl,
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
       if(!err.statusCode){
        err.statusCode = 500
       }
       next(err)
    })

   
   
}
exports.getSinglePost = (req, res, next) => {
    const postId = req.params.postId;
    PostModel.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post could not be found!');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message: 'Post fetched',
                post: post,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
