import { UserEntity } from "src/user/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { channelEntity } from "./channel.entity";
import {  Socket } from 'socket.io'

@Entity('userchannelEntity')
export class UserChannelEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    owner: boolean;

    @Column({ default: false })
    duoChannel: boolean;

    @Column({ default: false })
    administrator: boolean;

    @PrimaryColumn()
    channelId: number;

    @PrimaryColumn()
    userId: number;

    @Column({ nullable: true, type: 'timestamp', default:null })
    mute: Date;

    @ManyToOne(() => channelEntity, userchannel => userchannel.userChannel)
    @JoinColumn({ name: "channelId" })
    channel: channelEntity;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true, type: 'timestamp', default:null })
    deletedAt: Date | null;

    @ManyToOne(() => UserEntity, user => user.channels)
    @JoinColumn({ name: "userId" })
    user: UserEntity;
}
