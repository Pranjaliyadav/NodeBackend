const UserModel = require('../models/user')
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config();


exports.userSignup = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error('Validation failed!');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
      }
  
      const email = req.body.email;
      const password = req.body.password;
      const name = req.body.name;
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Create a new user instance
      const user = new UserModel({
        email,
        password: hashedPassword,
        name,
      });
  
      // Save the user to the database
      const result = await user.save();
  
      res.status(201).json({ message: 'User created', user: result });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };
  


exports.userLogin = async (req, res, next) =>{
    const email = req.body.email
    const password = req.body.password
    let loggedUser
    try{
        const user = await  UserModel.findOne({email : email})
        if(!user){
            const error = new Error('User not found!')
            error.statusCode = 401
            throw error
        }
        loggedUser = user
        const result = await bcrypt.compare(password, user.password)
        if(!result){
            const error = new Error('Wrong password!')
            error.statusCode = 401
            throw error
        }

        const token = jwt.sign(
            { //values token hold
            email : loggedUser.email,
            userId : loggedUser._id.toString()
        },process.env.TOKEN_SECRET_NAME,{expiresIn : '1h'})

        res.status(200).json({message : 'logged in', token , userId : loggedUser._id.toString()})
   
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }
   
   
}

exports.getUserStatus = async (req, res, next) =>{
    const userId = req.userId
    try{
        const user = await  UserModel.findById(userId)
        res.status(200).json({message : 'user status returned', status : user.status})
       
    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }
   
   
}

exports.updateUserStatus =async (req, res, next) =>{

    const userId = req.userId
    const errors = validationResult(req)
    console.log("here statu", req.body.status, req.body)
    if(!errors.isEmpty()){
        const error = new Error('Invalid status!')
        error.statusCode = 400
        throw error
    }
    try{
        const user = await UserModel.findById(userId)
        user.status = req.body.status
        await user.save()
        res.status(200).json({message : 'Updated status'})
      

    }
    catch(err){
        if(!err.statusCode){
            err.statusCode = 500
           }
           next(err)
    }
    
   

}