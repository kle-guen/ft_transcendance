import { IsEmail, IsNotEmpty } from "class-validator";
import { UserEntity } from "src/user/models/user.entity";

export class MessageDto {
    id?: string;
    createdAt?: Date;
    deletedAt?: Date;
    message?: string;
    invitation?: boolean;
    id_user?: UserEntity;
    idChannel?: UserEntity;
}