import { Router, Request, Response, NextFunction } from 'express';
import { PassportStatic } from 'passport';
import { User } from '../model/User';
import { Roles } from '../model/Roles';

export const configureRoutes = (passport: PassportStatic, router: Router): Router => {

    router.get('/', (req: Request, res: Response) => {
        res.status(200).send('Hello World!');
    });

    router.post('/register', async (req: Request, res: Response) => {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const roleType = Roles.viewer;

        try {
            const existingUser = await User.findOne({ email: email });

            if (existingUser) {
                return res.status(400).send('Email already exists.');
            }
            const newUser = new User({ email: email, username: username, password: password, roleType: roleType});
            const savedUser = await newUser.save();

            res.status(200).send(savedUser);
        } catch (error) {
            res.status(500).send('Internal server error.');
        }
    });

    router.post('/login', (req: Request, res: Response, next: NextFunction) => {
        passport.authenticate('local', (error: string | null, user: typeof User) => {
            if (error) {
                res.status(500).send(error);
            }
            else {
                if (!user) {
                    res.status(400).send('User not found.')
                } else {
                    req.login(user, (err: string | null) => {
                        if (err) {
                            res.status(401).send('Internal server error. ' + err);
                        } else {
                            res.status(200).send(user);  
                        }
                    });
                }
            }
        })(req, res, next);
    });

    router.post('/logout', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            req.logout((error) => {
                if (error) {
                    res.status(500).send('Internal server error. ' + error);
                } else {
                    res.status(200).send('Succesfully logged out.');
                }
            }) 
        } else {
            res.status(500).send('User is not logged in.');
        }
    });

    return router;
}