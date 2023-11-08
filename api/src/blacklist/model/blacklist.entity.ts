import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "src/user/models/user.entity";

@Entity('blacklistentity')
export class BlackListEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    blackListedUserId: number

    @Column()
    blackListedUserTargetId: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true, type: 'timestamp', default: null })
    deletedAt: Date | null;

    @ManyToOne(() => UserEntity, user => user.userIdBL)
    @JoinColumn({ name: "blackListedUserId" })
    blackListedUser: UserEntity;

    @ManyToOne(() => UserEntity, user => user.targetIdBL)
    @JoinColumn({ name: "blackListedUserTargetId" })
    blackListedUserTarget: UserEntity;
}
