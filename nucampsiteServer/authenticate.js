const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config.js');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);


export function verifyAdmin(req, res, next) {
    console.log(req.user);

    if (!req.user || !req.user.admin) {
        const err = new Error('You are not authorized to perform this operation!');                    
        err.status = 403;
        return next(err);
    } else {
        return next();
    }
}

//     if (!req.session.user) {
//         const authHeader = req.headers.authorization;
//         if (!authHeader) {
//             const err = new Error('You are not authenticated!');
//             res.setHeader('WWW-Authenticate', 'Basic');
//             err.status = 401;
//             return next(err);
//         }

//         const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//         const user = auth[0];
//         const pass = auth[1];
//         if (user === 'admin') {
//             req.user.admin = 'admin';
//             return next(); // authorized
//         } else {
//             const err = new Error('You are not authorized to perform this operation!');
//             res.setHeader('WWW-Authenticate', 'Basic');
//             err.status = 403;
//             return next(err);
//         }
//     } else {
//         if (req.user.admin === 'admin') {
//             return next();
//         } else {
//             const err = new Error('You are not authorized to perform this operation!');
//             err.status = 403;
//             return next(err);
//         }
//     }
// }

exports.verifyUser = passport.authenticate('jwt', {session: false});