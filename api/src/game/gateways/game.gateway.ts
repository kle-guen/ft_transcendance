import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { GameService } from '../services/game.service';
import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/models/user.entity';

@WebSocketGateway({ cors: true, origin: `http://localhost:4200/pong` } )

export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly GameService: GameService, private readonly UserService: UserService, private jwtService: JwtService) {}

    userIdsClassic = [];
    userIdsCustom = [];
    roomIdsClassic = [];
    roomIdsCustom = [];
    roomIdsPrivate = [];
    privateRoomNb = 0;
    roomNb = 0;

    @WebSocketServer()
    server: Server;

    createRoom(idRoom: number): string {
        const roomName = `match-${idRoom}`;
        return (roomName);
    }

    createPrivateRoom(idRoom: number): string {
        const roomName = `private-match-${idRoom}`;
        return (roomName);
    }

    async handleConnection(client: any) {
        const token: string[] = client.handshake.headers['authorization'].split(' ');
        try {
            const decodedToken = await this.jwtService.verifyAsync(token[1], { secret: process.env.JWT_SECRET });
            if (decodedToken) {
                client.handshake['userId'] = client.handshake['userId'];
            } else {
                client.emit('Error', "ServerEmit: wrong jwt");
                client.disconnect();
            }
        } catch (error) {
            client.emit('Error', "ServerEmit: wrong jwt catch");
        }
    }

    handleDisconnect(client: any) {
        const userId = client.handshake['userId'];
        let indexUser = this.userIdsClassic.indexOf(userId);
        if (indexUser == -1)
            indexUser = this.userIdsCustom.indexOf(userId);
        const room = this.GameService.getPlayerRoom(userId);
        if (indexUser > -1)
            this.userIdsClassic.indexOf(userId) > -1 ? this.userIdsClassic.splice(indexUser, 1) : this.userIdsCustom.splice(indexUser, 1);
        let indexRoom = this.roomIdsClassic.indexOf(room);
        if (indexRoom == -1)
            indexRoom = this.roomIdsCustom.indexOf(room);
        if (indexRoom > -1) {
            client.leave(room);
            this.roomIdsClassic.indexOf(room) > -1 ? this.roomIdsClassic.splice(indexRoom, 1) : this.roomIdsCustom.splice(indexRoom, 1);
        }
    }

    async createGame(playerOneId: UserEntity, playerTwoId: UserEntity, createdAt: Date, gameType: string): Promise<number>{

		return await this.GameService.createPost({
            createdAt: createdAt,
            deletedAt: new Date(),
            idPlayerOne : playerOneId,
            idPlayerTwo : playerTwoId,
            scorePlayerOne: 0,
            scorePlayerTwo: 0,
            gameType: gameType
		});
	}


    @SubscribeMessage('privateSocket')
    handlePrivateSocket(client: any, payload: any) {
        const userId = client.handshake['userId'];
        const room = this.GameService.getPlayerRoom(userId);
        client.join(room);
    }
    
    @SubscribeMessage('joinPrivateGame')
    async handleJoinPrivateGame(client: any, payload: any) {
        if (payload.action === 'create' && client.handshake['userId'] === payload.playerOneId) {
            client.join(payload.roomName);
            this.roomIdsPrivate.push(payload.roomName);
            this.GameService.createPrivateRoom(payload.roomName, payload.playerOneId, payload.playerTwoId);
            this.privateRoomNb++;
        }
        else if (this.roomIdsPrivate.indexOf(payload.roomName) > -1) {
            if (client.handshake['userId'] === payload.playerTwoId)
            {
                client.join(payload.roomName);
                client.emit('Side', {side : 1});
                const createdAt = new Date();
                const userIds = this.GameService.getPlayerIds(payload.roomName);
                const playerOneId: UserEntity = await this.UserService.getUserByUserId(userIds[0]);
                const playerTwoId: UserEntity = await this.UserService.getUserByUserId(userIds[1]);
                this.server.to(payload.roomName).emit('MatchFound', {
                    room : payload.roomName, 
                    nameP1 : playerOneId.userName,
                    avatarP1 : playerOneId.avatar,
                    nameP2 : playerTwoId.userName,
                    avatarP2: playerTwoId.avatar,
                });
                const idGame = await this.createGame(playerOneId, playerTwoId, createdAt, payload.mode);
                this.GameService.createGameInstance(this.server, payload.roomName, createdAt, idGame, playerOneId, playerTwoId, payload.mode);
            }
        }
    }

    @SubscribeMessage('joinGame')
    async handleJoinGame(client: any, payload: string) {
        const alreadyInGame = payload === 'classic' ? this.userIdsClassic.indexOf(client.handshake['userId']) : this.userIdsCustom.indexOf(client.handshake['userId']);
        if (alreadyInGame == -1)
            payload === 'classic' ? this.userIdsClassic.push(client.handshake['userId']) : this.userIdsCustom.push(client.handshake['userId']);
        else {
            const roomName = this.GameService.getPlayerRoom(client.handshake['userId']);
            client.join(roomName);
        }
    
        if (((payload === 'classic' && this.userIdsClassic.length % 2 == 0 && this.userIdsClassic.length > 0) 
        || (payload === 'custom' && this.userIdsCustom.length % 2 == 0 && this.userIdsCustom.length > 0)) && alreadyInGame == -1) {
            const roomName = payload === 'classic' ? this.roomIdsClassic[this.roomIdsClassic.length - 1] : this.roomIdsCustom[this.roomIdsCustom.length - 1];
            client.join(roomName);
            client.emit('Side', {side : 1});
            this.GameService.addPlayerTwo(roomName, client.handshake['userId']);
            const createdAt = new Date();
            const userIds = this.GameService.getPlayerIds(roomName);
            const playerOneId: UserEntity = await this.UserService.getUserByUserId(userIds[0]);
            const playerTwoId: UserEntity = await this.UserService.getUserByUserId(userIds[1]);
            this.server.to(roomName).emit('MatchFound', {
                room : roomName, 
                nameP1 : playerOneId.userName,
                avatarP1 : playerOneId.avatar,
                nameP2 : playerTwoId.userName,
                avatarP2: playerTwoId.avatar,
            });
            const idGame = await this.createGame(playerOneId, playerTwoId, createdAt, payload);
            this.GameService.createGameInstance(this.server, roomName, createdAt, idGame, playerOneId, playerTwoId, payload);
        }
        else if (alreadyInGame == -1) {
            const roomName = this.createRoom(this.roomNb);
            client.join(roomName);
            payload === 'classic' ? this.roomIdsClassic.push(roomName) : this.roomIdsCustom.push(roomName);
            this.GameService.createRoom(roomName, client.handshake['userId']);
            this.roomNb++;
        }
    }

    @SubscribeMessage('paddleCoordinates')
    handlePaddleCoordinates(client: Socket, payload: any) {
        const gameInstance = this.GameService.getGameInstance(payload.roomName);
        if (!gameInstance) {
            return;
        }
        if (payload.side == 0)
            gameInstance.paddleLeftTop = payload.paddleLeftTop;
        else
            gameInstance.paddleRightTop = payload.paddleRightTop;
    }

    @SubscribeMessage('playerLeftGame')
    async handlePlayerLeftGame(client: any) {
            const userId = client.handshake['userId'];
            const room = this.GameService.getPlayerRoom(userId);
            const game = this.GameService.getGameInstance(room);
            if (!game) {
                return ;
            }
            game.playerLeftGame(userId);
    }

    @SubscribeMessage('endGame')
    async handleGameResult(client : any, payload: any) {
        const userId = client.handshake['userId'];
        let indexUser = 0;
        if (payload == 'classic')
            indexUser = this.userIdsClassic.indexOf(userId);
        else
            indexUser = this.userIdsCustom.indexOf(userId);
        if (indexUser > -1)
            this.userIdsClassic.indexOf(userId) > -1 ? this.userIdsClassic.splice(indexUser, 1) : this.userIdsCustom.splice(indexUser, 1);
        const room = this.GameService.getPlayerRoom(userId);
        if (room == 'undefined')
            return ;
        let indexRoom = 0;
        if (payload == 'private') {
            indexRoom = this.roomIdsPrivate.indexOf(room);
            if (indexRoom > -1) {
                this.roomIdsPrivate.splice(indexRoom, 1);
                client.leave(room);
            }
        }
        else if (payload == 'classic') {
            indexRoom = this.roomIdsClassic.indexOf(room);
            if (indexRoom > -1) {
                this.roomIdsClassic.splice(indexRoom, 1);
                client.leave(room);
            }
        }
        else {
            indexRoom = this.roomIdsCustom.indexOf(room);
            if (indexRoom > -1) {
                this.roomIdsCustom.splice(indexRoom, 1);
                client.leave(room);
            }
        }
    }
}