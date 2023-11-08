import { Server } from 'socket.io'
import { GameService } from './services/game.service';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from '../user/services/user.service';

export class Game {

    constructor(private server: Server, private room: string, private createdAt: Date, private id: number, private readonly GameService: GameService, private playerOneId: UserEntity, private playerTwoId: UserEntity, private gameType: string, private readonly userService: UserService) {}

    /*init params*/
    gameAreaWidth = 800;
    gameAreaHeight = 500;
    minInitSpeedY = 0;
    maxInitSpeedY = 2; //speedX;
    scoreLimit = 5;
    initSpeedX = 3;
    minBallTop = 800 / 4;  //gameAreaHeight / 4;
    maxBallTop = 3 * 500 / 4;  //3 * gameAreaHeight / 4;
    paddleHeight = 80;
    paddleWidth = 8;
    gap = 20;
    midGap = 200;
    ballRadius = 10;
    speedX = 2;
    speedY = 2;
    gameStatus = 1;

    /*game params*/
    scoreP1 = 0;
    scoreP2 = 0;
    ballLeft = 390;
    ballTop = 240;
    paddleLeftTop = 210;
    paddleRightTop = 210;

    setKickOff() : void {
        const initSpeedY = Math.random() * (this.maxInitSpeedY - this.minInitSpeedY) + this.minInitSpeedY;
        const initballTop = Math.random() * (this.maxBallTop - this.minBallTop) + this.minBallTop; 
        
        this.ballLeft = 390;
        this.ballTop = Math.floor(initballTop);
        if ((this.scoreP1 + this.scoreP2) % 2 == 0)
            this.speedX = this.initSpeedX;
        else
            this.speedX = -1 * this.initSpeedX;
        this.speedY = Math.floor(initSpeedY);
    }

    playerLeftGame(playerId : Number) {
        if (playerId === this.playerOneId.userId) {
            this.scoreP2 = this.scoreLimit;
            this.scoreP1 = 0;
        }
        else {
            this.scoreP1 = this.scoreLimit;
            this.scoreP2 = 0;
        }
        this.gameStatus = 0;
    }

    setAngle(paddleY: number) : void {

        const relativeY = (this.ballTop + this.ballRadius / 2) - paddleY - this.paddleHeight / 2; //max paddleHeight / 2
        const normalizedRelativeY = relativeY / (this.paddleHeight / 2); //entre -1 et 1
        const bounceAngle = normalizedRelativeY * Math.PI / 4; // max angle PI/4
        const initialSpeed = Math.sqrt(this.speedX**2 + this.speedY**2);
        this.speedY = Math.sin(bounceAngle) * initialSpeed;
    }

    handleCollision() : void {
        if (this.ballLeft <= 0 || this.ballLeft >= this.gameAreaWidth - this.ballRadius) {
            if (this.ballLeft < this.gameAreaWidth / 2)
                this.scoreP2 += 1;
            else
                this.scoreP1 += 1;
            if (this.scoreP1 >= this.scoreLimit || this.scoreP2 >= this.scoreLimit) {
                this.gameStatus = 0;
                this.GameService.updatePost({id: this.id, idPlayerOneUserId: this.playerOneId, idPlayerTwoUserId: this.playerTwoId}, {
                    createdAt: this.createdAt,
                    deletedAt: new Date(),
                    idPlayerOne: this.playerOneId,
                    idPlayerTwo: this.playerTwoId,
                    scorePlayerOne: this.scoreP1,
                    scorePlayerTwo: this.scoreP2,
                    gameType: this.gameType
                });
                return ;
            }
            this.setKickOff();
        }
        else if (this.ballTop <= 0 || this.ballTop >= this.gameAreaHeight - this.ballRadius) {
            this.speedY *= -1;
            this.ballTop = (this.ballTop <= 0 ? 0 : this.gameAreaHeight - this.ballRadius);
        }
        else if ((this.ballLeft <= this.gap + this.paddleWidth && this.ballTop >= this.paddleLeftTop - this.ballRadius && this.ballTop <= this.paddleLeftTop + this.paddleHeight)
        || (this.ballLeft >= this.gameAreaWidth - this.gap - this.paddleWidth - this.ballRadius && this.ballTop >= this.paddleRightTop - this.ballRadius && this.ballTop <= this.paddleRightTop + this.paddleHeight)) {
            if (Math.abs(this.speedX) < 6)
                this.speedX *= -1.5;
            else
                this.speedX *= -1;
            this.setAngle((this.ballLeft < this.gameAreaWidth / 2) ? this.paddleLeftTop : this.paddleRightTop);
            this.ballLeft = (this.ballLeft <= this.gap + this.paddleWidth ? this.gap + this.paddleWidth : this.gameAreaWidth - this.gap - this.paddleWidth - this.ballRadius);
        }
        else if (this.gameType == "custom" && ((this.speedX > 0 && this.ballLeft >= this.midGap - this.ballRadius && this.ballLeft <= this.midGap + this.paddleWidth && this.ballTop >= this.paddleRightTop - this.ballRadius && this.ballTop <= this.paddleRightTop + this.paddleHeight)
        || (this.speedX < 0 && this.ballLeft <= this.gameAreaWidth - this.midGap + this.paddleWidth && this.ballLeft >= this.gameAreaWidth - this.midGap && this.ballTop >= this.paddleLeftTop - this.ballRadius && this.ballTop <= this.paddleLeftTop + this.paddleHeight))) {
            this.speedX *= -1;
            this.setAngle((this.ballLeft < this.gameAreaWidth / 2) ? this.paddleLeftTop : this.paddleRightTop);
            this.ballLeft = (this.ballLeft <= this.midGap + this.paddleWidth ? this.midGap - this.paddleWidth : this.gameAreaWidth - this.midGap + this.paddleWidth - this.ballRadius); 
        }
    }

    startBallMovement() : void  {
        this.playerOneId.status = 2;
        this.playerTwoId.status = 2;
        const gameLoop = setInterval(() => {
            this.ballLeft += this.speedX;
            this.ballTop += this.speedY;
            this.handleCollision();
            if (this.gameStatus == 0) {
                this.server.to(this.room).emit('gameResult', {
                    scoreP1: this.scoreP1,
                    scoreP2: this.scoreP2,
                });
                this.GameService.updatePost({id: this.id, idPlayerOneUserId: this.playerOneId, idPlayerTwoUserId: this.playerTwoId}, {
                    createdAt: this.createdAt,
                    deletedAt: new Date(),
                    idPlayerOne: this.playerOneId,
                    idPlayerTwo: this.playerTwoId,
                    scorePlayerOne: this.scoreP1,
                    scorePlayerTwo: this.scoreP2,
                    gameType: this.gameType
                });
                if (this.scoreP1 > this.scoreP2)
                    this.eloUpdate(this.playerOneId, this.playerTwoId);
                else
                    this.eloUpdate(this.playerTwoId, this.playerOneId);
                this.playerOneId.status = 1;
                this.playerTwoId.status = 1;
                clearInterval(gameLoop);
                return ;
            }
            this.server.to(this.room).emit('gameUpdate', {  
                ballLeft: this.ballLeft, 
                ballTop: this.ballTop,
                scoreP1: this.scoreP1,
                scoreP2: this.scoreP2,
                paddleLeftTop: this.paddleLeftTop,
                paddleRightTop: this.paddleRightTop,
                gameStatus: this.gameStatus });
        }, 16);  // 1000(1s) / 60 (fps) ~= 16 (ms/frame)
    }

    eloUpdate(win: UserEntity, lose: UserEntity) {
        const elo = this.getEloVariation(win.elo, lose.elo);
        this.userService.updatePost(win.userId, {
            userId: win.userId,
            userName: win.userName,
            double_auth: win.double_auth,
            elo: win.elo + elo,
            createdAt: win.createdAt,
            deletedAt: win.deletedAt,
            message: win.message,
            channels: win.channels,
            gamePlayerOne: win.gamePlayerOne,
            gamePlayerTwo: win.gamePlayerTwo,
            userIdBL: win.userIdBL,
            twoFactorAuthenticationSecret: win.twoFactorAuthenticationSecret,
            targetIdBL: win.targetIdBL,
            userIfriend: win.userIfriend,
            targetfriend: win.targetfriend,
        });
        this.userService.updatePost(lose.userId, {
            userId: lose.userId,
            userName: lose.userName,
            double_auth: lose.double_auth,
            elo: lose.elo - elo,
            createdAt: lose.createdAt,
            deletedAt: lose.deletedAt,
            message: lose.message,
            channels: lose.channels,
            gamePlayerOne: lose.gamePlayerOne,
            gamePlayerTwo: lose.gamePlayerTwo,
            userIdBL: lose.userIdBL,
            twoFactorAuthenticationSecret: lose.twoFactorAuthenticationSecret,
            targetIdBL: lose.targetIdBL,
            userIfriend: lose.userIfriend,
            targetfriend: lose.targetfriend,
        });
    }

    getEloVariation(win: number, lose: number): number {
        const i = Math.round((1 / (1 + Math.pow(10, (win - lose) / 400))) * 20);
        if (i < 1) return 1;
        return i;
    }
}