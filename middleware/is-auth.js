const jwt = require('jsonwebtoken')
require('dotenv').config();


module.exports = (req, res, next) =>{
    const authHeader = req.get('Authorization')
    if(!authHeader){
        const error = new Error('Invalid token')
        error.statusCode = 404
        throw error
    }
    const token = authHeader.split(' ')[1]
    let decodedToken
    try{
        decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_NAME)
    }
    catch(err){
        err.statusCode = 500
        throw err

    }
    if(!decodedToken){
        const error = new Error('Unauthorized user')
        error.statusCode = 401
        throw error
    }
    req.userId = decodedToken.userId
    next()
}