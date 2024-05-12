export interface User {
    _id: string;
    email: string;
    username: string;
    password: string;
    role: string;
}

export interface LoggedInUser {
    id: string;
    username: string;
    role: string;
}