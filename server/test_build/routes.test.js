const request = require('supertest');
const express = require('express');
const { configureRoutes } = require('../build/routes/routes');
const passport = require('passport');
const mongoose = require('mongoose');
const { configurePassport } = require('../build/passport/passport');
const { GridFSBucket } = require('mongodb');
const User = require('../build/model/User').User;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

beforeAll(async () => {
    mongoose.connect = jest.fn().mockResolvedValue({});
    mongoose.disconnect = jest.fn().mockResolvedValue({});
    mongoose.connection.db = {
        collection: jest.fn().mockReturnValue({
            find: jest.fn(),
            findOne: jest.fn(),
            insertOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
        }),
    };

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'videos' });
    app.use('/', configureRoutes(passport, express.Router(), bucket));

    app.use(passport.initialize());
    app.use(passport.session());

    configurePassport(passport);
});

afterAll(async () => {
    await mongoose.disconnect();
    jest.clearAllMocks();
});

describe('API Endpoints Tests', () => {

    describe('GET /', () => {
        it('should return Hello World', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toBe(200);
            expect(res.text).toBe('Hello World!');
        });
    });

    describe('POST /register', () => {
        it('should successfully register a user', async () => {
            const mockUserSave = jest.fn().mockResolvedValue({
                email: 'test@example.com',
                username: 'testuser',
                password: 'hashedpassword',
                role: 'viewer',
            });
            jest.spyOn(User, 'findOne').mockResolvedValue(null);
            jest.spyOn(User.prototype, 'save').mockImplementation(mockUserSave);

            const res = await request(app)
                .post('/register')
                .send({
                    email: 'test@example.com',
                    username: 'testuser',
                    password: 'securepassword',
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe('test@example.com');
            expect(res.body.username).toBe('testuser');
        });

        it('should fail if email already exists', async () => {
            jest.spyOn(User, 'findOne').mockResolvedValue({ email: 'test@example.com' });

            const res = await request(app)
                .post('/register')
                .send({
                    email: 'test@example.com',
                    username: 'testuser',
                    password: 'securepassword',
                });

            expect(res.statusCode).toBe(400);
            expect(res.text).toBe('Email already exists.');
        });
    });
});
