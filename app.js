const express = require('express')
const path = require('path')
const multer = require('multer')
require('dotenv').config();
const feedRoutes = require('./routes/feed')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGO_DB_CONNECTION_STRING
const { v4: uuidv4} = require('uuid');


const app = express()


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4())
    }
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/jpg' 
    ){
        cb(null, true)

    }
    else{
        cb(null, false)
    }
}
app.use(bodyParser.json()) //parse incoming json data
app.use(multer({storage, fileFilter}).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images'))) //to parse images statically


//prevents CORS issues
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*') //* means allow to every domain
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)

app.use((error, req, res, next) =>{
    console.log(error)
    const status = error.statusCode
    const message = error.message
    res.status(status).json({message })
})

mongoose.connect(MONGODB_URI)
.then( res => {
    console.log("connected to mongoose")
    app.listen(8080)
    
})
.catch(err =>{
    console.log(err)
})


