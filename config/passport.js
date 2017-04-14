var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy
var mongoose = require('mongoose');
var User = mongoose.model('users');

passport.use(new LocalStrategy({
    usernameField: 'email'
},
function (username, password, done) {
    User.findOne({email: username}, function (err, user) {
        if(err) { return done(err);}
        //return if user not found in db
        if(!user) {
            return done(null, false, {
                message: 'User not found'
            });
        }

        //return if password wrong
        if(!user.validPassword(user.password)) {
            return done(null, false, {
                message: 'Password wrong'
            });
        }

        //if credentials are correct, return user
        return done(null, user);
    });

}));