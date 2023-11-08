import { BlackListEntity } from "src/blacklist/model/blacklist.entity";
import { messageEntity } from "src/chat/model/message.entity";
import { UserChannelEntity } from "src/chat/model/userchannel.entity";
import { FriendEntity } from "src/friend/model/friend.entity";
import { GameEntity } from "src/game/models/game.entity";

export interface UserI{
    userId?: number;
    userName?: string;
    double_auth?: boolean;
    elo?: number;
    status?: number;
    createdAt?: Date;
    deletedAt?: Date | null;
    message?: messageEntity[];
    channels: UserChannelEntity[];
    gamePlayerOne: GameEntity[];
    gamePlayerTwo: GameEntity[];
    userIdBL: BlackListEntity[];
    twoFactorAuthenticationSecret: string;
    targetIdBL: BlackListEntity[];
    userIfriend: FriendEntity[];
    targetfriend: FriendEntity[];
}