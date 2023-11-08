import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { messageEntity } from "./message.entity";
import { UserChannelEntity } from "./userchannel.entity";
import { UserI } from "./chat.interface";
@Entity('channelEntity')
export class channelEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, default: '' })
    channelName: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ nullable: true, type: 'timestamp', default: null })
    deletedAt: Date | null;

    @Column({ type: 'varchar', length: 255, default: '' })
    password: string;

    @Column({ default : false})
    invitation: boolean;
    
    @OneToMany(() => UserChannelEntity, channels => channels.channel)
    userChannel: UserChannelEntity;

    @OneToMany(() => messageEntity, message => message.channel)
    messages: messageEntity[];
}
