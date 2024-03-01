const expect = require('chai').expect;
const sinon = require('sinon');
const db = require('../util/database')

const Auth = require('../models/auth');
const authController = require('../controllers/auth');
const { result } = require('../util/database');

describe('Auth Controller - Sign up', function() {

    it('it should throw and error with code 500 if accessing database fails', function(done) {
        sinon.stub(Auth, 'getEmail');
        Auth.getEmail.throws();

        const req = {
            body: {
                email: 'test@test.com'
            }
        }
        authController.postSignUp(req, {}, () => {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 500);
            done()
        });

        Auth.getEmail.restore();
    })

})