const expect = require('chai').expect

const authMiddleware = require('../middleware/is-auth')

it('should throw error if token not there', function(){
    const req = {
        get : function(headerName){
            return null
        }
    }

    expect(authMiddleware.bind(this, req, {} ,() =>{})).to.throw('Invalid token')
})