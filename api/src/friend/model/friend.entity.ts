import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "src/user/models/user.entity";

@Entity('friendentity')
export class FriendEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    friendUserId: number

    @Column()
    friendUserTargetId: number

    @Column({ type: 'boolean', default: false })
    isAccept: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true, type: 'timestamp', default: null })
    deletedAt: Date | null;

    @ManyToOne(() => UserEntity, user => user.userIfriend)
    @JoinColumn({ name: "friendUserId" })
    friendUser: UserEntity;

    @ManyToOne(() => UserEntity, user => user.targetfriend)
    @JoinColumn({ name: "friendUserTargetId" })
    friendUserTarget: UserEntity;
}
