const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Post { 
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User { 
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData { 
        token : String!
        userId : String!
    }

    type getPostsData {
        posts : [Post!]!
        totalPosts : Int!

    }

    input signUpData {
        email: String!
        password: String!
        name: String!
    }


    input loginData { 
        email : String!
        password : String!
    }

    input postCreateInputData {
        title : String!
        content : String!
        imageUrl : String!
    }


# all post query
    type Mutation {
        signupUser(userInput: signUpData): User!
        createPost(postCreateInput :postCreateInputData ) : Post!
       updatePost(id : ID!, postUpdateInput : postCreateInputData!) : Post!
       deletePost(id : ID!) : Boolean
    }
# all get queries
    type Query {
        loginUser(userInput : loginData) : AuthData!
        getPosts(page : Int!) : getPostsData!
        getPostById(id : ID!) : Post!
    }
`;

module.exports = typeDefs;


/**
 type - represents an object type in ur schema
    define shape of data your return in a query or mutation
    if String! , non nullable string
    String ,  can be null, but has to be string if passed
    [Post!]!  - indicates an array of post object where each item is non nullable, array also non null


input - define structure of data you pass into a query or mutation, like argumenets type
similar to type but specifically for inputs

Query - defines read operations that client can perform
fetch data from the server

Mutation - write operations defined. to modif server side data - create update delete


 **/