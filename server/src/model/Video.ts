import mongoose, { Document, Model, Schema } from 'mongoose';
import { Comment } from './Comment';

interface IVideo extends Document {
    user_id: string;
    username: string;
    video_id: string;
    title: string;
    description: string;
    upload_date: Date;
    likedBy?: string[];
    likesCount?: number;
    dislikedBy?: string[];
    dislikesCount?: number;
    views?: number;
    comments?: typeof Comment[];
}

const VideoSchema: Schema<IVideo> = new mongoose.Schema({
    user_id: { type: String, required: true },
    username: { type: String, required: true},
    video_id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true},
    upload_date: { type: Date, required: true },
    likedBy: [{ type: String }],
    likesCount: { type: Number, default: 0 },
    dislikedBy: [{ type: String }],
    dislikesCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    comments: [Comment]
});

export const Video: Model<IVideo> = mongoose.model<IVideo>('Video', VideoSchema);