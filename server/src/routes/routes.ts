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
import http from 'http';
import { URL } from 'url';
import promClient from 'prom-client';

// Create a Registry to store metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'server_'
});

// Create custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1]
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code']
});

const calculationErrors = new promClient.Counter({
  name: 'calculation_errors_total',
  help: 'Total number of calculation errors',
  labelNames: ['error_type']
});

const calculationTotal = new promClient.Counter({
  name: 'calculations_total',
  help: 'Total number of calculations performed',
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(calculationErrors);
register.registerMetric(calculationTotal);

export const configureRoutes = (passport: PassportStatic, router: Router, gfs: GridFSBucket): Router => {

    const trackRequestMetrics = (req: Request, res: Response, next: NextFunction) => {
        const startTime = process.hrtime();

        const endTimer = (statusCode: number) => {
            const [seconds, nanoseconds] = process.hrtime(startTime);
            const duration = seconds + nanoseconds / 1e9;
            const path = new URL(req.url, `http://${req.headers.host}`).pathname;
            
            httpRequestDuration
                .labels(req.method, path || '', statusCode.toString())
                .observe(duration);
            
            httpRequestTotal
                .labels(req.method, path || '', statusCode.toString())
                .inc();
        };

        res.on('finish', () => {
            endTimer(res.statusCode);
        });

        next();
    };

    router.use(trackRequestMetrics);

    router.get('/', (req: Request, res: Response) => {
        res.status(200).send('Hello World!');
    });

    router.get('/metrics', async (req: Request, res: Response) => {
        res.setHeader('Content-Type', register.contentType);
        try {
            const metrics = await register.metrics();
            res.status(200).send(metrics);
        } catch (error) {
            res.status(500).send('Error collecting metrics');
            console.error('Error occurred while collecting metrics');
        }
    });

    router.post('/register', async (req: Request, res: Response) => {
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const role = Roles.viewer;

        try {
            const existingEmail = await User.findOne({ email: email });

            if (existingEmail) {
                return res.status(400).send('Email already exists.');
            }

            const existingUsername = await User.findOne({ username: username });

            if (existingUsername) {
                return res.status(400).send('Username already exists.');
            }

            const newUser = new User({ email: email, username: username, password: password, role: role});
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
                    res.status(401).send('Incorrect email or password.');
                } else {
                    req.login(user, (err: string | null) => {
                        if (err) {
                            res.status(500).send('Internal server error.')
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
            res.status(403).send('User is not logged in.');
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

    router.get('/get-user/:username', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const username = req.params.username;
            const query = User.findOne({ username: username });
            query.then(data => {
                res.status(200).send(data);
            }).catch(error => {
                console.log(error);
                res.status(404).send('User not found.');
            })
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.delete('/delete-user/:sender_id/:_id', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const sender_id = req.params.sender_id;
            const _id = req.params._id;
            
            const query = User.findById(sender_id);
            query.then(sender => {
                if (!sender) {
                    return res.status(404).send('Sender not found.');
                }

                if (sender.role !== Roles.admin) {
                    return res.status(403).send('Permission denied.');
                }

                User.deleteOne({ _id: _id })
                    .then(() => {
                        User.find({})
                            .then(users => {
                                res.status(200).send(users);
                            })
                            .catch(error => {
                                console.log(error);
                                res.status(500).send('Internal server error.');
                            });
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).send('Internal server error.');
                    });
            })                        
        } else {
            res.status(403).send('User is not logged in.');
        }
    });


    router.get('/promote-user/:sender_id/:_id', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const sender_id = req.params.sender_id;
            const _id = req.params._id;

            const query = User.findById(sender_id);
            query.then(sender => {
                if (!sender) {
                    return res.status(404).send('Sender not found.');
                }

                if (sender.role !== Roles.admin) {
                    return res.status(403).send('Permission denied.');
                }

                User.findOneAndUpdate({ _id: _id }, { role: Roles.admin }, { new: true })
                .then(updatedUser => {
                    User.find({})
                        .then(users => {
                            res.status(200).send(users);
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500).send('Internal server error.');
                        });
                }).catch(error => {
                    res.status(404).send('User not found.');
                });
            })
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.get('/create-channel/:_id',  (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const _id = req.params._id;
            const query = User.findById(_id);
            query.then(user => {
                if (!user) {
                    return res.status(404).send('User not found.');
                }

                if (user.role !== Roles.viewer) {
                    return res.status(403).send('Permission denied.');
                }

                User.findOneAndUpdate({ _id: _id }, { role: Roles.channelowner }, { new: true })
                .then(updatedUser => {
                    res.status(200).send(updatedUser);
                }).catch(error => {
                    res.status(404).send('User not found.');
                });
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
                const { user_id, username, title, description} = req.body;
                const videoFile = req.file;

                if (!videoFile || !videoFile.buffer) {
                    throw new Error('No file uploaded or buffer is undefined');
                }

                const videoStream = Readable.from([videoFile.buffer]);

                const uploadStream = gfs.openUploadStream(title);
                videoStream.pipe(uploadStream);
    
                const video = new Video({
                    user_id,
                    username,
                    video_id: uploadStream.id,
                    title,
                    description,
                    upload_date: new Date(),
                });
                

                uploadStream.on('finish', async () => {
                    await video.save().then(() => {
                        res.status(200).send(video);
                    }).catch(error => {
                        console.error(error);
                        res.status(500).send('Internal server error.');
                    });
                });
                uploadStream.on('error', (error) => {
                    res.status(500).send('Internal server error.');
                });
            } catch (error) {
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.get('/list-videos', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const query = Video.find({})
            query.then(videos => {
                res.status(200).json(videos);
            })
            .catch(error => {
                console.log(error);
                res.status(500).send('Internal server error.');
            });
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

    router.post('/update-video/:video_id/:user_id/:role', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const video_id = req.params.video_id;
            const user_id = req.params.user_id;
            const role = req.params.role;
            const { title, description } = req.body;
            const query = Video.findById(video_id);

                
            query.then(video => {
            if (!video) {
                    return res.status(404).send('Video not found.');
                }

                if (user_id !== video.user_id && role !== Roles.admin) {
                    return res.status(403).send('Permission denied');
                }

                Video.findOneAndUpdate({ _id: video_id }, { title, description }, { new: true })
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
            }) 
            .catch(error => {
                console.error(error);
                res.status(500).send('Internal server error.');
            });
        } else {
            res.status(403).send('User is not logged in.');
        }
    });
    
    router.delete('/delete-video/:video_id/:user_id/:role', (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const video_id = req.params.video_id;
            const user_id = req.params.user_id;
            const role = req.params.role;
            const query = Video.findById(video_id);
            query.then(async video => {
                if (!video) {
                    return res.status(404).send('Video not found.');
                }

                if (user_id !== video.user_id && role !== Roles.admin) {
                    return res.status(403).send('Permission denied');
                }

                await gfs.delete(new Types.ObjectId(video.video_id));

                Video.deleteOne({ _id: video_id }).then(() => {
                    res.status(200).json({message: 'Video deleted successfully.'});
                }).catch(error => {
                    console.error(error);
                    res.status(500).send('Internal server error.');
                });
            }).catch(error => {
                console.error('Error deleting video:', error);
                res.status(500).send('Internal server error.');
            });
            
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.post('/comment/:video_id/:user_id', async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const video_id = req.params.video_id;
            const user_id = req.params.user_id;
            const comment = req.body.comment;
    
            try {
                const video = await Video.findById(video_id);
                if (!video) {
                    return res.status(404).send('Video not found.');
                }

                const user = await User.findById(user_id);
                if (!user) {
                    return res.status(404).send('User not found.');
                }
    
                const newComment = {
                    user_id,
                    username: user.username,
                    comment
                };
    
                await Video.findOneAndUpdate(
                    { _id: video_id },
                    {
                        $push: { comments: newComment }
                    },
                    { new: true }
                );
    
                const updatedVideo = await Video.findById(video_id);
                if (!updatedVideo) {
                    return res.status(404).send('Video not found.');
                }
                res.status(200).send(updatedVideo);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.delete('/delete-comment/:video_id/:user_id/:comment_id', async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const video_id = req.params.video_id;
            const user_id = req.params.user_id;
            const comment_id = req.params.comment_id;
    
            try {
                const video = await Video.findById(video_id);
                if (!video) {
                    return res.status(404).send('Video not found.');
                }

                const user = await User.findById(user_id);
                if (!user) {
                    return res.status(404).send('User not found.');
                }

                const comment = await Video.findOne({ _id: video_id, 'comments._id': comment_id });
                if (!comment) {
                    return res.status(404).send('Comment not found.');
                }

                if (user_id === comment.user_id || user.role === Roles.admin || (user.role === Roles.channelowner && video.user_id === user_id)) {
                    await Video.findOneAndUpdate(
                        { _id: video_id },
                        {
                            $pull: { comments: { _id: comment_id } },
                        },
                        { new: true }
                    );
                } else {
                    return res.status(403).send('Permission denied.');
                }
    
                const updatedVideo = await Video.findById(video_id);
                if (!updatedVideo) {
                    return res.status(404).send('Video not found.');
                }
                res.status(200).send(updatedVideo);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.get('/like-video/:video_id/:user_id', async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const video_id = req.params.video_id;
            const user_id = req.params.user_id;
    
            try {
                const video = await Video.findOne({ _id: video_id, likedBy: user_id });
                if (video) {
                    return res.status(400).send('Video already liked.');
                }
    
                const dislikedVideo = await Video.findOne({ _id: video_id, dislikedBy: user_id });
                if (dislikedVideo) {
                    await Video.updateOne(
                        { _id: video_id },
                        {
                            $pull: { dislikedBy: user_id },
                            $inc: { dislikesCount: -1 }
                        }
                    );
                }
    
                await Video.findOneAndUpdate(
                    { _id: video_id },
                    {
                        $push: { likedBy: user_id },
                        $inc: { likesCount: 1 }
                    },
                    { new: true }
                );
    
                const updatedVideo = await Video.findById(video_id);
                if (!updatedVideo) {
                    return res.status(404).send('Video not found.');
                }
                res.status(200).send(updatedVideo);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    router.get('/dislike-video/:video_id/:user_id', async (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            const video_id = req.params.video_id;
            const user_id = req.params.user_id;
    
            try {
                const video = await Video.findOne({ _id: video_id, dislikedBy: user_id });
                if (video) {
                    return res.status(400).send('Video already disliked.');
                }
    
                const likedVideo = await Video.findOne({ _id: video_id, likedBy: user_id });
                if (likedVideo) {
                    await Video.updateOne(
                        { _id: video_id },
                        {
                            $pull: { likedBy: user_id },
                            $inc: { likesCount: -1 }
                        }
                    );
                }
    
                await Video.findOneAndUpdate(
                    { _id: video_id },
                    {
                        $push: { dislikedBy: user_id },
                        $inc: { dislikesCount: 1 }
                    },
                    { new: true }
                );
    
                const updatedVideo = await Video.findById(video_id);
                if (!updatedVideo) {
                    return res.status(404).send('Video not found.');
                }
                res.status(200).send(updatedVideo);
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal server error.');
            }
        } else {
            res.status(403).send('User is not logged in.');
        }
    });

    return router;
}