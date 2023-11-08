import { UserEntity } from "src/user/models/user.entity";

export interface gamePost{
    createdAt: Date;
    deletedAt: Date;
    idPlayerOne: UserEntity;
    idPlayerTwo: UserEntity;
    scorePlayerOne: number;
    scorePlayerTwo: number;
    gameType: string;
}