export class User {
    id?: string;
    name!: string;
    email!: string;
    password!: string;
    avatarPath!: string;

    constructor(obj?:any) {
        this.id = obj ? obj.id : '';
        this.name = obj ? obj.name : '';
        this.email = obj ? obj.email : '';
        this.password = obj ? obj.password : '';
        this.avatarPath = obj ? obj.avatarPath : '';
    }
}