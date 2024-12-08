const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type TestData {
        text: String
        views: Int
    }

    type Query {
        hello: TestData
    }
`;

module.exports = typeDefs;
