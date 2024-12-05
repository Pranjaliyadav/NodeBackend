const UserModel = require('../models/user')
const {validationResult} = require('express-validator')
const bcrypt = require('bcrypt')


exports.userSignup = (req, res, next) =>{

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new Error('Validation failed!')
        error.statusCode = 422
        error.data = errors.array()
        throw error
    }


    const email = req.body.email
    const password = req.body.password
    const name = req.body.name
    bcrypt.hash(password, 12)
    .then(
        hashedPassword => {
            const user  = new UserModel({
                email,
                 password : hashedPassword,
                name
            })
            return user.save()
        }
    )
    .then(result  =>{
        res.status(201).json({message : 'User created', user : result})
    })
    .catch(err => {
          if(!err.statusCode){
               err.statusCode = 500
              }
              next(err)
           
    })
}