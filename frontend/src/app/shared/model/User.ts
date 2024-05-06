export interface User {
    email: string;
    username: string;
    password: string;
    roleType: string;
}

export interface LoggedInUser {
    id: string;
    roleType: string;
}