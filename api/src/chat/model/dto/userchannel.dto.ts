import { IsEmail, IsNotEmpty } from "class-validator";
import { UserChannelEntity } from "../userchannel.entity";
import { messageEntity } from "../message.entity";

export class UserChannelDto {
    id?: number;
    status?: number;
    username?: string;
    double_auth?: boolean;
    createdAt?: Date;
    deletedAt?: Date;
    channels?: UserChannelEntity[];
    message?: messageEntity[];

}