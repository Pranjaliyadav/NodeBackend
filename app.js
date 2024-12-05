const express = require('express')

require('dotenv').config();
const feedRoutes = require('./routes/feed')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGO_DB_CONNECTION_STRING
const app = express()

app.use(bodyParser.json()) //parse incoming json data

//prevents CORS issues
app.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', '*') //* means allow to every domain
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/feed', feedRoutes)

mongoose.connect(MONGODB_URI)
.then( res => {
    console.log("connected to mongoose")
    app.listen(8080)
    
})
.catch(err =>{
    console.log(err)
})


