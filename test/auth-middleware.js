const expect = require('chai').expect

const authMiddleware = require('../middleware/is-auth')

describe('Auth middleware', function() {

    it('should throw error if token not there', function(){
        const req = {
            get : function(headerName){
                return null
            }
        }
    
        expect(authMiddleware.bind(this, req, {} ,() =>{})).to.throw('Invalid token')
    })
    
    it('should throw error if token is only 1 string', function(){
        const req = {
            get : function(headerName){
                return 'abc'
            }
        }
    
        expect(authMiddleware.bind(this, req, {} ,() =>{})).to.throw()
    })

    it('should throw error if token is not verified', function(){
        const req = {
            get : function(headerName){
                return 'Bearer abc'
            }
        }
    
        expect(authMiddleware.bind(this, req, {} ,() =>{})).to.throw()
    })

    it('should give userId after decoding token', function(){
        const req = {
            get : function(headerName){
                return 'Bearer abc'
            }
        }
        authMiddleware(req, {}, () =>{})
        expect(req).to.have.property('userId')
    })
})

