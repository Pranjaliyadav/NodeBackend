const UserModel = require('../models/user')
const PostModel = require('../models/post')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const {clearImage}  = require('../utils/file')

const resolvers = {
    Query: {
       loginUser : async(_, {userInput}, {req}) =>{
            const {email, password} = userInput
            const errors = []

            if(!validator.isEmail(email)){
                errors.push({message : 'E-Mail is invalid!'})

            }
            if(validator.isEmpty(password) || !validator.isLength(password, {min : 5})){
                errors.push({message : 'Password is too short!'})
            }
            const user = await UserModel.findOne({email})
            if(!user){
                const error = new Error('User not found!')
                error.status = 404
                throw error
            }

            const isEqual = await bcrypt.compare(password, user.password)
            if(!isEqual) {
                const error = new Error('Incorrect password!')
                error.status = 401
                throw error
            }

            const token = jwt.sign({
                userId : user._id.toString(),
                email : user.email,

            },

            process.env.TOKEN_SECRET_NAME,
            {expiresIn : '1h'}

        )

         return {token, userId : user._id.toString()}



       },

       getPosts : async (_,{page},{req}) =>{
        if(!req.isAuth){
            const error = new Error('Not Authenticated!')
            error.code = 401
            throw error
        }
        if(!page){
            page =1
        }
        const perPage = 2
        const totalPosts = await PostModel.find().countDocuments()
        const posts = await PostModel.find()
                    .sort({createdAt : -1})
                    .skip((page - 1)*perPage)
                    .limit(perPage)
                    .populate('creator')
         return {posts : posts.map(p =>{
            return {
                ...p._doc, 
                _id : p._id.toString(), 
                createdAt : p.createdAt.toISOString(),
                 updatedAt : p.updatedAt.toISOString()}
         }),
        totalPosts 
        }


       },
       getPostById : async(_,{id},{req} ) =>{
        if(!req.isAuth){
            const error = new Error('Not Authenticated!')
            error.code = 401
            throw error
        }
        const post = await PostModel.findById(id)
        .populate('creator')
        if(!post){
            const error = new Error('Post not found')
            error.code = 404
            throw error
        }
        return {
            ...post._doc,
            _id : post._id.toString(),
            createdAt : post.createdAt.toISOString(),
            updatedAt : post.updatedAt.toISOString()
        }
       }
    },
    Mutation : {
        signupUser : async(_, {userInput}, {req}) =>{
            const {email , password, name} = userInput
            const errors = []
            if(!validator.isEmail(email)){
                errors.push({message : 'E-Mail is invalid!'})

            }
            if(validator.isEmpty(password) || !validator.isLength(password, {min : 5})){
                errors.push({message : 'Password is too short!'})
            }
           
            if(validator.isEmpty(name) || !validator.isLength(name, {min : 2})){
                errors.push({message : 'Name is too short!'})
            }

            if(errors.length > 0){
                const error = new Error('Invalid input')
                error.data = errors
                error.code = 422
                throw error
            }


            const existingUser = await UserModel.findOne({email})
            if(existingUser){
                const error = new Error('User exists already!')
                throw error
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new UserModel({
                email,
                password : hashedPassword,
                name
            })

            const createdUser = await user.save()
            return {...createdUser._doc, _id : createdUser._id.toString()} //createdUser._doc contains only actual data, exclude metadata
        },
        createPost : async(_, {postCreateInput} , {req}) =>{
        if(!req.isAuth){
                const error = new Error('Not Authenticated!')
                error.code = 401
                throw error
            }

            const {title, content, imageUrl} = postCreateInput
            const errors = []

            if(validator.isEmpty(title) || !validator.isLength(title, {min : 5})){
                errors.push({message : 'Title is invalid!'})
            }
            if(validator.isEmpty(content) || !validator.isLength(content, {min : 5})){
                errors.push({message : 'Content is invalid!'})
            }
            if(errors.length > 0){
                const error = new Error('Invalid input')
                error.data = errors
                error.code = 422
                throw error
            }
            const user = await UserModel.findById(req.userId)
            if(!user){
                const error = new Error('User not found')
                error.data = errors
                error.code = 422
                throw error
            }

            const post  = new PostModel({
                title,
                content,
                imageUrl,
                creator : user
            })


            const createdPost = await post.save()
            user.posts.push(createdPost)
            await user.save()

            return {...createdPost._doc, _id : createdPost._id.toString(), createdAt : createdPost.createdAt.toISOString(), updatedAt : createdPost.updatedAt.toISOString()}


        },
        updatePost : async(_, {id,postUpdateInput}, {req}) =>{
            if(!req.isAuth){
                const error = new Error('Not Authenticated!')
                error.code = 401
                throw error
            }
            
            const {title, content,imageUrl} = postUpdateInput
            const errors = []

            if(validator.isEmpty(title) || !validator.isLength(title, {min : 5})){
                errors.push({message : 'Title is invalid!'})
            }
            if(validator.isEmpty(content) || !validator.isLength(content, {min : 5})){
                errors.push({message : 'Content is invalid!'})
            }
            if(errors.length > 0){
                const error = new Error('Invalid input')
                error.data = errors
                error.code = 422
                throw error
            }

            const post = await PostModel.findById(id).populate('creator')
            if(!post){
                const error = new Error('Post not found')
                error.code = 404
                throw error
            }
            if(post.creator._id.toString() !== req.userId.toString()){
                const error = new Error('Not authorized to delete')
                error.code = 403
                throw error
            }

            post.title = title
            if(imageUrl !== 'undefined'){

                post.imageUrl = imageUrl
            }
            post.content = content

            const updatedPost = await post.save()

            return {...updatedPost._doc, _id : updatedPost._id.toString(), createdAt : updatedPost.createdAt.toISOString(), updatedAt : updatedPost.updatedAt.toISOString()}
        },

        deletePost : async(_,{id},{req}) => {
            if(!req.isAuth){
                const error = new Error('Not Authenticated!')
                error.code = 401
                throw error
            }

            const post = await PostModel.findById(id)
            if(!post){
                const error = new Error('Post not found')
                error.code = 404
                throw error
            }

            if(post.creator.toString() !== req.userId.toString()){
                const error = new Error('Forbidden')
                error.statusCode = 403
                throw error
            }
            clearImage(post.imageUrl)
            await PostModel.findByIdAndDelete(id)
            const result = await UserModel.findById(req.userId)
            result.posts.pull(id)
            await result.save()
            return true
        }

    }
};

module.exports = resolvers;


/** usage example of querya nd mutation 
 *  Query: {
        placeholder: () => {
            return "This is a placeholder query.";
        },
    },
    Mutation: {
        signup: async (_, { userInput }) => {
            const { email, password, name } = userInput;
            // Add your logic here (e.g., save the user to the database)
            const newUser = {
                _id: "1", // Normally, this comes from your database
                name,
                email,
                password,
                status: "Active",
                posts: [],
            };
            return newUser;
        },
    },
 * 
 */