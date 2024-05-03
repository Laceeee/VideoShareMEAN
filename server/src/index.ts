import express from 'express';
import { configureRoutes } from './routes/routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import passport from 'passport';
import { configurePassport } from './passport/passport';
import mongoose from 'mongoose';

const app = express();
const port = 5000;
const dbUrl = 'mongodb://localhost:6000/my_db';

// mongoose connection
mongoose.connect(dbUrl).then(() => {
    console.log('Successfully connected to MongoDB.');
}).catch(error => {
    console.log(error);
    return;
})

// bodyParser
app.use(bodyParser.urlencoded({extended: true}));

// cookieParser
app.use(cookieParser());

//session
const sessionOptions: expressSession.SessionOptions = {
    secret: 'testsecret',
    resave: false,
    saveUninitialized: false
};
app.use(expressSession(sessionOptions));

// passport
app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

app.use('/', configureRoutes(passport, express.Router()));

app.listen(port, () => {
    console.log('Serves in listening on port: ' + port.toString());
});