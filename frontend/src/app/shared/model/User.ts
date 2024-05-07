export interface User {
    email: string;
    username: string;
    password: string;
    roleType: string;
}

export interface LoggedInUser {
    id: string;
    username: string;
    roleType: string;
}