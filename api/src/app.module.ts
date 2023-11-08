import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameEntity } from './game/models/game.entity';
import { UserChannelEntity } from './chat/model/userchannel.entity';
import { messageEntity } from './chat/model/message.entity';
import { channelEntity } from './chat/model/channel.entity';
import { AccessTokenService } from './access_token/service/access_token.service';
import { AccessTokenController } from './access_token/controller/access_token.controller';
import { UserEntity } from './user/models/user.entity';
import { BlackListEntity } from './blacklist/model/blacklist.entity';
import { FriendEntity } from './friend/model/friend.entity';
import { APP_GUARD } from '@nestjs/core';
import { BlackListService } from './blacklist/service/blacklist.service';
import { UserService } from './user/services/user.service';
import { ChatService } from './chat/service/chat.service';
import { ChatGateway } from './chat/gateway/chatGateway';
import { ChatController } from './chat/controller/chat.controller';
import { FriendService } from './friend/service/friend.service';
import { FriendController } from './friend/controller/friend.controller';
import { GameService } from './game/services/game.service';
import { GameGateway } from './game/gateways/game.gateway';
import { GameController } from './game/constrollers/game.controller';
import { BlackListController } from './blacklist/controller/blacklist.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './access_token/jwt.strategy';
import { UserController } from './user/constrollers/user.controller';
import { AuthMiddleware } from './utils/authmiddleware';
import { JwtAuthGuard } from './access_token/jwt-auth.guard';
import { HomeGateway } from './home/home.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' }, // facultatif : définir l'expiration
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
      entities: [
        GameEntity,
        UserChannelEntity,
        UserEntity,
        messageEntity,
        BlackListEntity,
        FriendEntity
      ],
    }),
    TypeOrmModule.forFeature([UserChannelEntity,
      channelEntity,
      messageEntity,
      UserEntity,
      BlackListEntity,
      FriendEntity,
      GameEntity
    ]),
  ],
  controllers: [
    UserController,
    AppController,
    ChatController,
    FriendController,
    GameController,
    AccessTokenController,
    BlackListController
  ],
  providers: [
    FriendService,
    AppService,
    ChatGateway,
    HomeGateway,
    ChatService,
    UserService,
    BlackListService,
    GameService,
    HomeGateway,
    JwtStrategy,
    AccessTokenService,
    GameGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }

