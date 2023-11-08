import { UserEntity } from "src/user/models/user.entity";

export interface BlacklistDto {
    createdAt: Date,
    deletedAt: Date | null,
    blackListedUser: UserEntity,
    blackListedUserTarget: UserEntity,
}