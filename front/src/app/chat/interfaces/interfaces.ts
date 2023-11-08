export interface UserI {
    status: number;
    userName: string;
    double_auth: boolean;
    createdAt: Date;
    deletedAt: Date | null;
    mute: Date;
    userId: number;
}
export interface UserChannelI {
    id: number;
    owner: boolean;
    administrator: boolean;
    duoChannel: boolean;
    channelId: number;
    userId: number;
    channel: ChannelI;
    createdAt: Date;
    mute: Date;
    user: UserI;
}
export interface messageI {
    id: number;
    user: UserI;
    channelId: number;
    userName: string;
    createdAt: Date;
    deletedAt: Date;
    message: string;
    userId: number;
    invitation: boolean;
    channel: ChannelI;
}
export interface ChannelI {
    id: number;
    duoChannel: boolean;
    users: UserI[];
    userAdmins: number[];
    userMuted: number[];
    password: string;
    invitation: boolean;
    channelName: string;
    createdAt: Date;
    deletedAt: Date;
    owner: number;
}
export interface Blacklist {
    id: number;
    createdAt: Date;
    deletedAt: Date | null;
    blackListedUser: UserI;
    blackListedUserId: number;
    blackListedUserTargetId: number;
    blackListedUserTarget: UserI;
}

export interface DialogData {
    channelName: string;
    joinedchannelName: string;
    password: string;
    invite: boolean;
    name: string;
    rooms: ChannelI[];
}