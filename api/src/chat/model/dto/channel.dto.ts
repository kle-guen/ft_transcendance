import { IsEmail, IsNotEmpty } from "class-validator";
import { messageI } from "../chat.interface";

export class ChannelDto {

    id?: string;
    chatmessage?: messageI[];
    owner?: string;
    password?: string;
    invitation?: boolean;
    admins?: string[];
    channelName?: string;
    createdAt?: Date
    deletedAt?: Date;
    channelType?: Record<string, any>;
}