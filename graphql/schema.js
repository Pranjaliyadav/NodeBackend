const {buildSchema} = require('graphql')

module.exports = buildSchema(`

    type TestData {
    text : String
    views : Int
    }

    type RootQuery {
        hello : TestData 
    }
    schema {
        query : RootQuery
    }
    `)

    //hello : String
    //hello is query, String is query return type