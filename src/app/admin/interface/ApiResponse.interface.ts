import { login } from "./login.interface";


export interface ApiResponse extends login {
    token: string;
    body?
}
