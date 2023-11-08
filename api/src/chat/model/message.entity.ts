import { IsNotEmpty, IsString } from "class-validator";
import { UserEntity } from "src/user/models/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { channelEntity } from "./channel.entity";
import { Socket } from "dgram";

@Entity('messageEntity')
export class messageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn()
    channelId: number;

    @PrimaryColumn()
    userId: number;

    @Column({ type: 'boolean', default: 0})
    invitation: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    deletedAt: Date | null;

    @ManyToOne(() => UserEntity, user => user.message)
    @JoinColumn({ name: "userId" })
    user: UserEntity;

    @IsNotEmpty()
    @IsString()
    @Column({ type: 'varchar', length: 255, default: '' })
    userName: string;


    @ManyToOne(() => channelEntity, channel => channel.messages) // Assuming the correct property name is 'messages'
    @JoinColumn({ name: "channelId" })
    channel: channelEntity;


    @IsNotEmpty()
    @IsString()
    @Column({ type: 'varchar', length: 255, default: '' })
    message: string;
}
