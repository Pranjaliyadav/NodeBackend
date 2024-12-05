exports.getPosts = (req, res, next) =>{
    //will send json response
    res.status(200).json({
        posts : [{ 
            _id : '1',
            title : 'First Post',
             content : 'nothing!', 
             imagUrl :'images/pic.png' ,
            creator : {
                name : 'Pranjali'
            },
            createdAt : new Date()
            }],
       
    })
}

exports.createPost = (req, res, next) =>{
    const title = req.body.title
    const content = req.body.content

    res.status(201).json({
        message : 'Post created successfully',
        post : {id : new Date().toISOString, title, content}
    })
}