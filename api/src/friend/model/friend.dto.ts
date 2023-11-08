import { UserEntity } from "src/user/models/user.entity";

export interface FriendDto {
    createdAt: Date,
    deletedAt: Date | null,
    isAccept: boolean;
    friendUser: UserEntity,
    friendUserTarget: UserEntity,
}