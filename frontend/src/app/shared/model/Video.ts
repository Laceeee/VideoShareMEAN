import { Comment } from "./Comment";

export interface Video {
    user_id: string,
    username: string,
    video_id: string,
    title: string,
    description: string,
    upload_date: Date,
    likedBy?: [string],
    likesCount?: number,
    dislikedBy?: [string],
    dislikesCount?: number,
    views: number,
    comments: [Comment]
}