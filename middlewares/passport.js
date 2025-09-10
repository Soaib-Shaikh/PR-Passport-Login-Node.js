const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/userSchema');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy({usernameField: "email"}, async(email, password, done)=>{
    try {
        let user = await User.findOne({email});

        if(user){
            let isValid = await bcrypt.compare(password, user.password);
            if(isValid){
                return done(null, user);
            }
            else{
                return done(null, false, {message: 'Invalid email or password.'});
            }
        }
        else{
            return done(null, false, {message: 'User not found.'});
        }
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user,done)=>{
    return done(null, user.id);
});

passport.deserializeUser(async(id, done)=>{
    try {
        let user = await User.findById(id);
        if(user){
            return done(null, user);
        }
        else{
            return done(null, false, {message: 'User not found.'});
        }
    } catch (error) {
        return done(error, false);
    }
});

module.exports = passport;