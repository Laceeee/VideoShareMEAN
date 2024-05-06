import { Router, Request, Response, NextFunction } from 'express';
import { PassportStatic, use } from 'passport';
import { User } from '../model/User';
import { Roles } from '../model/Roles';
import { Video } from '../model/Video';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';
import { Types } from 'mongoose';
import multer from 'multer';
import mongoose from 'mongoose';

export const configureRoutes = (passport: PassportStatic, router: Router, gfs: GridFSBucket): Router => {

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
                    res.status(401).send('Incorrect email or password.')
                } else {
                    req.login(user, (err: string | null) => {
                        res.status(200).send(user);
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

    router.get('/checkAuth', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            res.status(200).send(true);
        } else {
            res.status(401).send(false);
        }
    });
    
    router.get('/getAllUsers', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = User.find();
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                console.log(error);
                res.status(500).send('Internal server error.');
            })
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    const upload = multer({ 
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 50 * 1024 * 1024,
            files: 1
        }
    });

    const handleUpload = (req: Request, res: Response, next: NextFunction) => {
        upload.single('video')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).send('File size limit exceeded. Maximum file size is 50MB.');
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(413).send('Only one file is allowed.');
                } else {
                    return res.status(413).send(err.message);
                }
            } else if (err) {
                return res.status(500).send('Internal server error.');
            }
            next();
        });
    };

    router.post('/upload', handleUpload, async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            try {
                const { user_id, title, description} = req.body;
                const videoFile = req.file;

                if (!videoFile || !videoFile.buffer) {
                    throw new Error('No file uploaded or buffer is undefined');
                }

                const videoStream = Readable.from([videoFile.buffer]);

                const uploadStream = gfs.openUploadStream(title);
                videoStream.pipe(uploadStream);
    
                const video = new Video({
                    user_id,
                    video_id: uploadStream.id,
                    title,
                    description,
                    upload_date: new Date(),
                });
                await video.save();
    
                res.status(200).send(video);
            } catch (error) {
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.get('/get-video/:_id', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const _id = req.params._id;
            const query = Video.findOneAndUpdate({ _id: _id }, { $inc: { views: 1 }}, {new: true});
            query.then(video => {
                res.status(200).send(video);
            }).catch(error => {
                console.log(error);
                res.status(500).send('Internal server error.');
            })
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'videos' });

    router.get('/stream-video/:_id', async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const _id = req.params._id;
        
            try {
                const videoId = new ObjectId(_id);

                const videoObject = await bucket.find({ _id: videoId }).toArray();
                if (videoObject.length === 0) {
                    return res.status(404).send('Video not found.');
                }

                const downloadStream = bucket.openDownloadStream(videoId);

                downloadStream.pipe(res);
            } catch (error) {
                console.error('Error retrieving video:', error);
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.put('/update-video/:_id', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const _id = req.params._id;
            const { title, description } = req.body;

            if (!title || !description) {
                return res.status(400).send('Title and description are required.');
            }

            Video.findOneAndUpdate({ _id: _id }, { title, description }, { new: true })
                .then(updatedVideo => {
                    if (!updatedVideo) {
                        return res.status(404).send('Video not found.');
                    }
                    res.status(200).send(updatedVideo);
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).send('Internal server error.');
                });
        } else {
            res.status(403).send('User is not logged in.');
        }
    });
    
    router.delete('/delete-video/:_id', async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            try {
                const _id = req.params._id;
    
                const video = await Video.findOne({ _id: _id });
                if (!video) {
                    return res.status(404).send('Video not found.');
                }
    
                await gfs.delete(new Types.ObjectId(video.video_id));
    
                await Video.deleteOne({ _id: _id });
    
                res.status(200).send('Video deleted successfully.');
            } catch (error) {
                console.error('Error deleting video:', error);
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    return router;
}