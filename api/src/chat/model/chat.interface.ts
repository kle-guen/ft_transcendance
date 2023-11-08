import { UserChannelEntity } from "./userchannel.entity";
import { messageEntity } from "./message.entity";
import { UserEntity } from "src/user/models/user.entity";
import { channelEntity } from "./channel.entity";
import { IsNotEmpty, isNotEmpty } from "class-validator";
import { channel } from "diagnostics_channel";


export interface ChannelI {
    id?: number;
    channelName?: string;
    createdAt?: Date;
    deletedAt?: Date | null;
    password?: string;
    invitation?: boolean;
}

export interface SocketID {
    socketID: string;
    socketUserID : string;
}

export interface messageI{
    id?: number;
    createdAt?: Date;
    channelId: number;
    userId: number;
    userName: string;
    invitation: boolean;
    deletedAt?: Date | null;
    user?: UserEntity;
    channel?: channelEntity;
    message?: string;
}


export interface UserI{
    userId?: number;
    status?: number;
    username?: string;
    double_auth?: boolean;
    createdAt?: Date;
    deletedAt?: Date | null;
    channels?: UserChannelEntity[];
}