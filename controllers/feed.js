const {validationResult} = require('express-validator')
const PostModel = require('../models/post')
const fs = require('fs')
const path = require('path')
const UserModel = require('../models/user')

exports.getPosts = (req, res, next) =>{
    const currentPage = req.query.page || 1
    const perPage = 2
    let totalItems

    PostModel.find()
    .countDocuments()
    .then(count => {
        totalItems = count
        return   PostModel.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
    })

    .then(posts =>{
        let modifiedPost = posts
         
        res.status(200).json({
            posts : posts,
            message : 'Fetched posts successfully',
            totalItems
           
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
    const userId = req.userId
    let creator
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
        creator : userId
    })

    newPost
    .save()
    .then(result =>{
        return UserModel.findById(userId)
    })
    .then(result =>{
        creator = result
        result.posts.push(newPost)
        return result.save()
    })
    .then(
        result =>{
         
            console.log("new post result", result)
            res.status(201).json({
                message : 'Post created successfully',
                post : newPost,
                creator : {_id : creator._id.toString(), name : creator.name}
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

exports.editPost = (req, res, next) =>{
    const postId = req.params.postId
    const title = req.body.title
    const content = req.body.content
    let imageUrl = req.body.image

    if(req.file){
        imageUrl = req.file.path.replace("\\" ,"/");
    }

    if(!imageUrl){
        const error = new Error( 'No image provided!')
        error.statusCode = 422
        throw error
    }

    PostModel.findById(postId)
    .then(result =>{
        if(!result){
            const error = new Error( 'No Post found!')
            error.statusCode = 404
            throw error
        }
        if(result.creator.toString() !== req.userId){
            const error = new Error( 'Forbidden')
            error.statusCode = 403
            throw error
        }
        if(imageUrl !== result.imageUrl){
            clearImage(result.imageUrl)
        }
        result.title = title
        result.content = content
        result.imageUrl = imageUrl
        return result.save()
    })
    .then(result =>{
        res.status(200).json({message : 'Post updated!', post : result})
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    })
}


exports.deletePost = (req, res, next) =>{
    const postId = req.params.postId
    PostModel.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('No Post found!')
            error.statusCode = 404
            throw error
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Forbidden')
            error.statusCode = 403
            throw error
        }
        clearImage(post.imageUrl)
        return PostModel.findByIdAndDelete(postId)
    })
    .then(result =>{
        return UserModel.findById(req.userId)

    })
    .then(result => {
        result.posts.pull(postId)
        return result
    })
    .then(result =>{
        console.log(result)
        res.status(200).json({message : 'Delete post'})
    })
    .catch(err =>{
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    })
}


const clearImage = (filePath) =>{
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err,"file delete error"))
}
