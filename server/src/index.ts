import express from 'express';
import { configureRoutes } from './routes/routes';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import passport from 'passport';
import { configurePassport } from './passport/passport';
import mongoose from 'mongoose';
import cors from 'cors';
import { GridFSBucket } from 'mongodb';

const app = express();
const port = 5000;
const dbUrl = 'mongodb://localhost:6000/my_db';

// mongoose connection
mongoose.connect(dbUrl).then(() => {
    console.log('Successfully connected to MongoDB.');
    const connection = mongoose.connection;
    const gfs = new GridFSBucket(connection.db, {
        bucketName: 'videos'
    });
    app.use('/', configureRoutes(passport, express.Router(), gfs));
}).catch(error => {
    console.log(error);
    return;
})

// cors
const whitelist = ['http://localhost:4200']
const corsOptions = {
    origin: (origin: string | undefined, callback: (error: Error | null, allowed?: boolean) => void) => {
        if (whitelist.indexOf(origin!) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS.'));
        }
        callback(null, true);
    },
    credentials: true
}

app.use(cors(corsOptions));

// bodyParser
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({ limit: '50mb' }));

// express.json
app.use(express.json({limit: '50mb'}));

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

app.listen(port, () => {
    console.log('Serves in listening on port: ' + port.toString());
});