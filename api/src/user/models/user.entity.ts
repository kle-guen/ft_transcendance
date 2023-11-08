import { messageEntity } from "src/chat/model/message.entity";
import { UserChannelEntity } from "src/chat/model/userchannel.entity";
import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { GameEntity } from "src/game/models/game.entity";
import { channelEntity } from "src/chat/model/channel.entity";
import { BlackListEntity } from "src/blacklist/model/blacklist.entity";
import { FriendEntity } from "src/friend/model/friend.entity";
@Entity('userEntity')
export class UserEntity {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column({ type: 'varchar', length: 255, default: '' })
    userName: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    ftUser: string;

    @Column({ type: 'varchar', length: 255, default: '../../assets/avatar.png' })
    avatar: string;

    @Column({ default: 1 })
    double_auth: boolean;

    @Column({ default: 1000 })
    elo: number;


    @Column({ default: 0 })
    status: number;

    @Column({ type: 'varchar', length: 255, default: '' })
    twoFactorAuthenticationSecret: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    deletedAt: Date | null;

    @OneToMany(() => UserChannelEntity, userChannel => userChannel.user)
    channels: UserChannelEntity[];

    @OneToMany(() => messageEntity, message => message.user)
    message: messageEntity[];
    
    @OneToMany(() => GameEntity, game => game.idPlayerOne)
    gamePlayerOne: GameEntity[];

    @OneToMany(() => GameEntity, game => game.idPlayerTwo)
    gamePlayerTwo: GameEntity[];

    @OneToMany(() => BlackListEntity, blacklist => blacklist.blackListedUser)
    userIdBL: BlackListEntity[];

    @OneToMany(() => BlackListEntity, blacklist => blacklist.blackListedUserTarget)
    targetIdBL: BlackListEntity[];

    @OneToMany(() => FriendEntity, friend => friend.friendUser)
    userIfriend: FriendEntity[];

    @OneToMany(() => FriendEntity, friend => friend.friendUserTarget)
    targetfriend: FriendEntity[];
}
