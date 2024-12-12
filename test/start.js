const expect = require('chai').expect


describe('random test', function() {

    it('should add number correctly', function() { //first arg is just a string describing what your test does 
        const num1 = 2 
        const num2 = 3
        expect(num1+ num2).to.equal(5)
    })
    
    it('should not give a result of 6', function() { //first arg is just a string describing what your test does 
        const num1 = 2
        const num2 = 3
        expect(num1+ num2).not.to.equal()
    })
})
