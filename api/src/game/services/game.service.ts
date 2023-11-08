import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { GameEntity } from '../models/game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { gamePost } from '../models/game.interface';
import { from, Observable } from 'rxjs';
import { Server } from 'socket.io';
import { Game } from '../game';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class GameService {
    constructor(
      @InjectRepository(GameEntity)
      private readonly gameRepository: Repository<GameEntity>,
      private readonly userService: UserService
    ) { }

    private gameInstances = new Map<string, Game>();
    private privateGameInstances = new Map<string, Game>();
    private gameRooms = new Map<string, number[]>();
    private playerRoom = new Map<number, string>();

    createGameInstance(server: Server, room: string, createdAt: Date, id: number, playerOneId: UserEntity, playerTwoId: UserEntity, gameType: string): Game {
        const newGame = new Game(server, room, createdAt, id, this, playerOneId, playerTwoId, gameType, this.userService);
        this.gameInstances.set(room, newGame);
        newGame.startBallMovement();
        return newGame;
    }

    createRoom(room: string, playerOneId: number): void {
        const userIds : number[] = []
        userIds.push(playerOneId);
        this.playerRoom.set(playerOneId, room);
        this.gameRooms.set(room, userIds);
    }

    createPrivateRoom(room: string, playerOneId: number, playerTwoId): void {
        const userIds : number[] = []
        userIds.push(playerOneId);
        userIds.push(playerTwoId);
        this.playerRoom.set(playerOneId, room);
        this.playerRoom.set(playerTwoId, room);
        this.gameRooms.set(room, userIds);
    }

    addPlayerTwo(room : string, playerTwoId: number)
    {
        const userIds = this.gameRooms.get(room);
        this.playerRoom.set(playerTwoId, room);
        userIds.push(playerTwoId);
    }

    getGameInstance(room: string): Game | undefined {
        return this.gameInstances.get(room);
    }

    getPlayerIds(room: string): number[] | undefined {
        return this.gameRooms.get(room);
    }

    getPlayerRoom(userId : number): string | undefined {
        return this.playerRoom.get(userId);
    }

    async createPost(gamePost: gamePost): Promise<number> {
        const createdGame = await this.gameRepository.save(gamePost);
        return createdGame.id;
    }

    findAllPosts():Observable<gamePost[]> {
        return from(this.gameRepository.find());
    }

    updatePost(id:any, gamePost: gamePost): Observable<UpdateResult> {
        return from(this.gameRepository.update(id,gamePost))
    }

    deletePost(id:number): Observable<DeleteResult> {
        return from(this.gameRepository.delete(id));
    }
}
