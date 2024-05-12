export interface User {
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