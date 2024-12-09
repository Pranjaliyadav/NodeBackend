const UserModel = require('../models/user')
const PostModel = require('../models/post')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
require('dotenv').config();


const resolvers = {
    Query: {
       loginUser : async(_, {userInput}, req) =>{
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


       }
    },
    Mutation : {
        signupUser : async(_, {userInput}, req) =>{
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