import { UserEntity } from "src/user/models/user.entity";
import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('game')
export class GameEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn()
    idPlayerOneUserId: number;

    @PrimaryColumn()
    idPlayerTwoUserId: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    deletedAt: Date;

    @ManyToOne(() => UserEntity, user => user.gamePlayerOne)
    @JoinColumn({ name: "idPlayerOneUserId" })
    idPlayerOne: UserEntity;

    @ManyToOne(() => UserEntity, user => user.gamePlayerTwo)
    @JoinColumn({ name: "idPlayerTwoUserId" })
    idPlayerTwo: UserEntity;

    @Column({ default: 0 })
    scorePlayerOne: number;

    @Column({ default: 0 })
    scorePlayerTwo: number;

    @Column({ type: 'varchar', length: 255, default: '' })
    gameType: string;
}
