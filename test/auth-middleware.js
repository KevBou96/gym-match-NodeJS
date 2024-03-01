const expect = require('chai').expect;
const auth = require('../middleware/is-auth').verifyUser
const jwt = require('jsonwebtoken')
const sinon = require('sinon')


// unit test sample

describe('Auth Middleware', function() {
    it('should throw an error if no authorization header is present', function() {
        const req = {
            get: function() {
                return null
            }
        }
        expect(auth.bind(this, req, {}, () => {})).to.throw('Not authenticated')
    })
    
    it('should throw an error if the authorization header is only one string', function() {
        const req = {
            get: function() {
                return 'xyz'
            }
        };
        expect(auth.bind(this, req, {}, () => {})).to.throw()
    })

    it('should yield a userId after token has been verified', function() {
        const req = {
            get: function() {
                return 'Bearer sjdlkasjdlkasjdlkasjlk'
            }
        };
        // sinon
        sinon.stub(jwt, 'verify');
        jwt.verify.returns({userId: 'abc'})
        auth(req, {}, () => {});
        expect(req).to.have.property('userId')
        jwt.verify.restore()
    })

    it('should throw an error if token cannot be verified', function() {
        const req = {
            get: function() {
                return 'Bearer xyz'
            }
        };
        expect(auth.bind(this, req, {}, () => {})).to.throw()
    })

    
})

