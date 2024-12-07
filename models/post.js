const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
    title :{
        type : String,
        required : true
    },
    imageUrl :{
        type : String,
        required : true
    },
    content :{
        type : String,
        required : true
    },
    creator :{
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    }
},
{timestamps : true} //mongoose adds timestamp when new object is added to DB, we get createdAt, updatedAt
)

module.exports = mongoose.model('Post', postSchema)