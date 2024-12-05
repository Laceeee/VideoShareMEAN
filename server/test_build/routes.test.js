const request = require('supertest');
const express = require('express');
const { configureRoutes } = require('../build/routes/routes');
const passport = require('passport');
const mongoose = require('mongoose');
const mongodb_1 = require('mongodb');
const mongoose_2 = require('mongoose');

const { User } = require('../build/model/User');
const { configurePassport } = require('../build/passport/passport');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/my_db', { useNewUrlParser: true, useUnifiedTopology: true });
    const bucket = new mongodb_1.GridFSBucket(mongoose_2.connection.db, { bucketName: 'videos' });
    configureRoutes(passport, app, bucket);

    app.use(passport.initialize());
    app.use(passport.session());

    configurePassport(passport);
});

afterAll(async () => {
    await mongoose.disconnect();
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
