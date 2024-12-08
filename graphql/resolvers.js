const resolvers = {
    Query: {
        hello: () => {
            return {
                text: 'Hellowww',
                views: 124
            };
        }
    }
};

module.exports = resolvers;
