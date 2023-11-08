import * as bcrypt from 'bcrypt';


const saltOrRounds = 10;

export function encodePassword(rawPassword:string ){

    return bcrypt.hashSync(rawPassword, saltOrRounds);
}

export function comparePassword(rawPassword:string, hash:string){
    return bcrypt.compareSync(rawPassword,hash);

}