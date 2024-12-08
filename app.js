// const express = require('express')
// const path = require('path')
// const multer = require('multer')
// require('dotenv').config();
// const bodyParser = require('body-parser')
// const mongoose = require('mongoose')
// const MONGODB_URI = process.env.MONGO_DB_CONNECTION_STRING
// const { v4: uuidv4} = require('uuid');
// const {ApolloServer} = require('@apollo/server')
// const {startStandaloneServer} = require('@apollo/server/standalone')
// const schemaGql = require('./graphql/schema')
// const resolverGql = require('./graphql/resolvers')
// const serverGql = new ApolloServer({
//     schemaGql,
//     resolverGql,
//   })
   
// // const { url } = await startStandaloneServer(serverGql)

// const app = express()


// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'images');
//     },
//     filename: function(req, file, cb) {
//         cb(null, uuidv4())
//     }
// });

// const fileFilter = (req, file, cb) =>{
//     if(file.mimetype === 'image/png' || 
//         file.mimetype === 'image/jpeg' || 
//         file.mimetype === 'image/jpg' 
//     ){
//         cb(null, true)

//     }
//     else{
//         cb(null, false)
//     }
// }
// app.use(bodyParser.json()) //parse incoming json data
// app.use(multer({storage, fileFilter}).single('image'))

// app.use('/images', express.static(path.join(__dirname, 'images'))) //to parse images statically


// //prevents CORS issues
// app.use((req, res, next)=>{
//     res.setHeader('Access-Control-Allow-Origin', '*') //* means allow to every domain
//     res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE')
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
//     next()
// })

// app.use('/graphql',serverGql )

// app.use((error, req, res, next) =>{
//     console.log(error)
//     const status = error.statusCode
//     const message = error.message
//     const data = error.data
//     res.status(status).json({message , data})
// })

// mongoose.connect(MONGODB_URI)
// .then( res => {
//     console.log("connected to mongoose")
//     app.listen(8080)
    



// })
// .catch(err =>{
//     console.log(err)
// })


const express = require('express');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_DB_CONNECTION_STRING;
const { v4: uuidv4 } = require('uuid');
const typeDefs = require('./graphql/schema'); // Replace with your schema definition
const resolvers = require('./graphql/resolvers'); // Replace with your resolver implementation

// Initialize Express app
const app = express();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'images'),
    filename: (req, file, cb) => cb(null, uuidv4()),
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json()); // Parse incoming JSON data
app.use(multer({ storage, fileFilter }).single('image')); // Handle file uploads
app.use('/images', express.static(path.join(__dirname, 'images'))); // Serve static files

// Prevent CORS issues
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all domains
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200)
    }
    next();
});

// Initialize Apollo Server
const startServer = async () => {
    const server = new ApolloServer({
        typeDefs, // Your GraphQL schema
        resolvers, // Your resolvers
        context: ({ req }) => ({ req }), // Pass request to context if needed
        playground : true,
        formatError(err) {
            if(!err.originalError){

                return err
            }
            const data = err.originalError.data
            const message = err?.message || 'An error occured'
            const code = err.originalError.code || 500
            return {message, status : code, data}
        }
    });

    await server.start(); // Start the Apollo Server
    server.applyMiddleware({ app, path: '/graphql' }); // Attach Apollo Server to Express
};

// Global error handler
app.use((error, req, res, next) => {
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.message || 'An unexpected error occurred';
    const data = error.data || null;
    res.status(status).json({ message, data });
});

// Connect to MongoDB and start the server
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        return startServer(); // Start Apollo Server
    })
    .then(() => {
        app.listen(8080, () => {
            console.log('Server running on http://localhost:8080');
            console.log('GraphQL endpoint at http://localhost:8080/graphql');
        });
    })
    .catch(err => console.error('Failed to connect to MongoDB:', err));
