const express = require('express')
const {body} = require('express-validator')

const UserModel = require('../models/user')
const authController = require('../controllers/auth')

const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.put('/signup',
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, {req})=>{
            return UserModel.findOne({email : value})
            .then(userDoc =>{
                if(userDoc){
                    return Promise.reject('Email address already exists')
                }
            })
        })
        .normalizeEmail(),

        body('password')
        .trim()
        .isLength({min : 5}),

        body('name')
        .trim()
        .not()
        .isEmpty()
    ]
    ,authController.userSignup)

router.post('/login', authController.userLogin)

router.get('/get-status', isAuth, authController.getUserStatus)

router.put('/update-status', isAuth,
    [
        body('status')
        .isLength({min : 3})
        .isString()
        
        
    ],
    authController.updateUserStatus)

module.exports = router

