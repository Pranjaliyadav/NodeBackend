const {validationResult} = require('express-validator')
const PostModel = require('../models/post')
const fs = require('fs')
const path = require('path')
const UserModel = require('../models/user')
const io = require('../socket')
const post = require('../models/post')


exports.getPosts = async (req, res, next) =>{
    const currentPage = req.query.page || 1
    const perPage = 2

    try{
        const totalItems = await  PostModel.find()
        .countDocuments()
        const posts = await PostModel.find()
        .populate('creator')
        .skip((currentPage - 1) * perPage)
        .limit(perPage)

        res.status(200).json({
            posts : posts,
            message : 'Fetched posts successfully',
            totalItems
           
        })

    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }
    
    
}

exports.createPost =async (req, res, next) =>{
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

    try{

        await  newPost.save()
        const userFound = await UserModel.findById(userId)
        creator = userFound
        userFound.posts.push(newPost)
        await userFound.save()

        //.emit() will send to all
        //.broadcast() will send to everyone except the one who sent request.
        io.getIO().emit('create-post', //event name 
            { //data u want to send
            action : 'create',
            post : newPost}
        )

        res.status(201).json({
            message : 'Post created successfully',
            post : newPost,
            creator : {_id : creator._id.toString(), name : creator.name}
        })
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }
   
   
   
   
}
exports.getSinglePost = async (req, res, next) => {
    const postId = req.params.postId;
    try{

        const post = await PostModel.findById(postId)
        if (!post) {
            const error = new Error('Post could not be found!');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            message: 'Post fetched',
            post: post,
        });
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }

};

exports.editPost = async (req, res, next) =>{
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

    try{
        const result = await  PostModel.findById(postId)
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
        await result.save()
        res.status(200).json({message : 'Post updated!', post : result})
   
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }
   
}


exports.deletePost = async (req, res, next) =>{
    const postId = req.params.postId
    try{
        const post = await 
        PostModel.findById(postId)
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
        await PostModel.findByIdAndDelete(postId)
        const result = await UserModel.findById(req.userId)
        result.posts.pull(postId)
        await result.save()
        res.status(200).json({message : 'Delete post'})
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }
   
   
}


const clearImage = (filePath) =>{
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err,"file delete error"))
}
