import { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';
import { User } from '../model/User';

export const configurePassport = (passport: PassportStatic): PassportStatic => {

    passport.serializeUser((user: Express.User, done) => {
        done(null, user);
    });

    passport.deserializeUser((user: Express.User, done) => {
        done(null, user);
    })

    passport.use('local', new Strategy((username, password, done) => {
        const query = User.findOne({email: username});
        query.then(user => {
            if (user) {
                user.comparePassword(password, (error, isMatch) => {
                    if (error) {
                        done(error);
                    }
                    if (isMatch) {
                        done(null, { id: user._id, username: user.username, role: user.role });
                    } else {
                        done(null, undefined);
                    }
                });
            } else {
                done(null, undefined);
            }
        }).catch(error => {
            done(error);
        })
    }));

    return passport;
}