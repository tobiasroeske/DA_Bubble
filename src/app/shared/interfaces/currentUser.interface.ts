export interface CurrentUser {
    id?: string;
    name: string;
    email: string;
    avatarPath: string;
    selected?:boolean;
    loginState: 'loggedIn' | 'loggedOut' | 'idle';
}