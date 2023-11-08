import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { messageI } from '../model/chat.interface';
import { ChannelI } from '../model/chat.interface';
import { ChatService } from '../service/chat.service';
import { channel, subscribe } from 'diagnostics_channel';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/models/user.entity';
import { UserChannelDto } from '../model/dto/userchannel.dto';
import { IsNull } from 'typeorm';
import { UserService } from 'src/user/services/user.service';
import { BlackListService } from 'src/blacklist/service/blacklist.service';
import { comparePassword, encodePassword } from 'src/utils/bcrypt';
import { channelEntity } from '../model/channel.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/access_token/jwt-auth.guard';
@WebSocketGateway({ cors: true, origin: `http://localhost:4200/chat` })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private userService: UserService, private readonly chatService: ChatService, private jwtService: JwtService, private blackListService: BlackListService) { }

    @WebSocketServer()
    server: Server;

    private clientSocket = new Map<number, Socket>();

    async handleConnection(client: any) {

        const token: string[] = client.handshake.headers['authorization'].split(' ');
        try {
            const decodedToken = await this.jwtService.verifyAsync(token[1], { secret: process.env.JWT_SECRET });
            if (decodedToken) {
                this.clientSocket.set(decodedToken.userId, client);
                client.handshake['userId'] = decodedToken.userId;
            } else {
                client.emit('Error', "ServerEmit: wrong jwt");
                client.disconnect();
            }
        } catch (error) {
            client.emit('Error', "ServerEmit: wrong jwt catch");
        }
    }

    handleDisconnect(client: any) {
        this.server.to('')
        this.server.emit('RefreshRoom');
    }

    @SubscribeMessage('AskPublicRooms')
    async handleAskPublicRooms(client: Socket) {
        const publicChannels = await this.chatService.findPublicChannel();
        const userChannels = await this.chatService.findUserChannel();
        let filteredChannels: channelEntity[] = [];

        publicChannels.forEach(channels => {
            const userchannel = userChannels.find(userchannels => userchannels.channel.channelName === channels.channelName)
            if (userchannel.duoChannel === false)
                filteredChannels.push(userchannel.channel);
        })
        client.emit('AskPublicRoomsOn', filteredChannels);
    }

    @SubscribeMessage('setPassword')
    async handleSetPassword(client: Socket, payload: any) {
        const password = encodePassword(payload.password);
        const status = await this.chatService.setPassword(client.handshake['userId'], payload.channelName, password)
        if (status === 0)
            this.server.emit('RefreshRoom');
        if (status === 1)
            client.emit('Error', "ServerEmit: cannot setPassword in duo channel");
    }


    @SubscribeMessage('inviteUser')
    async handleInviteUser(client: Socket, payload: any) {
        const channelExists = await this.chatService.findChannelByChannelName(payload.channelName);
        const user = await this.userService.findUser(client.handshake['userId']);
        const userTarget = await this.userService.findUserIdByuserName(payload.target);
        const UserChannel = await this.chatService.findUserChannelByChannelByUserId(client.handshake['userId'], channelExists);
        const UserChannelTarget = await this.chatService.findUserChannelByChannelByUserId(userTarget.userId, channelExists);

        if (user !== undefined && userTarget !== undefined && UserChannel !== undefined && channelExists !== undefined && UserChannelTarget === null) {
            const userchannel = {
                owner: false,
                administrator: false,
                mute: null,
                createdAt: new Date(),
                channelId: UserChannel.channel.id,
                user: userTarget,
                userId: userTarget.userId,
                channel: UserChannel.channel,
            }
            await this.chatService.createUserChannel(userchannel);
            this.server.to('bonjour').emit('')
            this.server.emit('RefreshRoom');
        }
        else
            client.emit('Error', "ServerEmit: Error: could not invite user");
    }


    @SubscribeMessage('setPrivate')
    async handleSetPrivate(client: Socket, payload: any) {

        const status = await this.chatService.setPrivate(client.handshake['userId'], payload.channelName);
        if (status === 0)
            this.server.emit('RefreshRoom');
        if (status === 1)
            client.emit('Error', "ServerEmit: cannot setPrivate in duo channel");
    }


    @SubscribeMessage('setPublic')
    async handleSetPublic(client: Socket, payload: any) {
        const status = await this.chatService.setPublic(client.handshake['userId'], payload.channelName);
        this.server.emit('RefreshRoom');
        if (status === 1)
            client.emit('Error', "ServerEmit: cannot setPublic in duo channel");
    }

    @SubscribeMessage('setAdministrator')
    async handleSetAdministrator(client: Socket, payload: any) {
        const status = await this.chatService.setAdministrator(payload.channelName, client.handshake['userId'], payload.userTargetId);
        if (status === 0)
            this.server.emit('RefreshRoom');
        if (status === 1)
            client.emit('Error', "ServerEmit: cannot setAdministrator in duo channel");
    }


    @SubscribeMessage('banUser')
    async handleBanUser(client: Socket, payload: any) {
        const status = await this.chatService.banUser(payload.channelName, client.handshake['userId'], payload.userTargetId);
        if (status === 0)
            this.server.emit('RefreshRoom');
        if (status === 1)
            client.emit('Error', "ServerEmit: cannot set banUser in duo channel");
    }



    @SubscribeMessage('kickUser')
    async handleKickUser(client: Socket, payload: any) {
        const status = await this.chatService.kickUser(payload.channelName, client.handshake['userId'], payload.userTargetId);
        if (status === 0) {
            this.clientSocket.get(payload.userTargetId).leave(payload.channelName);
            this.server.emit('RefreshRoom');
        }
        else if (status === 1)
            client.emit('Error', "ServerEmit: cannot set kickUser in duo channel");
        else if (status === 2)
            client.emit('Error', "ServerEmit: payload.channelName, client.handshake['userId'], payload.userTargetId undefined");
    }


    @SubscribeMessage('BlacklistOn')
    async handleBlacklistUserOn(client: Socket, payload: any) {
        const status = await this.chatService.BlacklistOn(payload.channelName, client.handshake['userId'], payload.userTargetId);
        this.server.emit('RefreshRoom');
    }


    @SubscribeMessage('BlacklistOff')
    async handleBlacklistUserOff(client: Socket, payload: any) {

        const status = await this.chatService.BlacklistOff(payload.channelName, client.handshake['userId'], payload.userTargetId);
        this.server.emit('RefreshRoom');
    }

    @SubscribeMessage('muteUser')
    async handleMuteUser(client: Socket, payload: any) {

        const status = await this.chatService.muteUser(payload.channelName, client.handshake['userId'], payload.userTargetId);
        if (status === 0)
            this.server.emit('RefreshRoom');
        else if (status === 1)
            client.emit('Error', "ServerEmit: cannot set muteUser in duo channel");
    }


    @SubscribeMessage('deletePassword')
    async handleDeletePassword(client: Socket, payload: any) {

        await this.chatService.deletePassword(client.handshake['userId'], payload.channelName);
        this.server.to(payload.channelName).emit('RefreshRoom');
    }

    @SubscribeMessage('AskRoomEmit')
    async handleAskRoomEmit(client: Socket, payload: any) {
        const channelsObservable = await this.chatService.findUserChannel();
        client.emit('AskRoomOn', channelsObservable);
    }

    @SubscribeMessage('AskRoomMessageEmit')
    async handleAskRoomMessageEmit(client: Socket, payload: any) {
        const message = await this.chatService.getMessagesByChannelId(payload.channel_id);
        client.emit('AskRoomMessageOn', message);
    }

    @SubscribeMessage('blackListedUsersEmit')
    async handleblackListedUsers(client: Socket, payload: any) {


        const blackList = await this.blackListService.getBlackListByUserId(client.handshake['userId']);
        client.emit('blackListedUsersOn', blackList);
    }

    @SubscribeMessage('deleteChannel')
    async handleDeleteChannel(client: Socket, payload: any) {

        if (client.handshake['userId'] === undefined || payload.channel === undefined) {
            client.emit('Error', "ServerEmit: client.handshake['userId'] undefined && payload.channel undefined");
            return;
        }
        const userChannel = await this.chatService.findUserChannelByChannelByUserIdOwner(client.handshake['userId'], payload.channel)
        if (userChannel !== undefined) {
            await this.chatService.deleteChannel(userChannel.channelId, client.handshake['userId'])
            const channelsObservable = await this.chatService.findUserChannel();
            this.server.emit('AskRoomOn', channelsObservable, true);
        } else
            client.emit('Error', "ServerEmit: Error userChannel unfind");
    }

    @SubscribeMessage('messageEmit')
    async handleMessage(client: Socket, payload: any) {
        const channelExists = await this.chatService.findChannelById(payload.channel_id);
        if (!channelExists) {
            client.emit('Error', "ServerEmit: channel doest Exist");
            return;
        }
        const userChannel = await this.chatService.findUserChannelByChannelByUserId(client.handshake['userId'], channelExists)
        if (userChannel === null) {
            client.emit('Error', "ServerEmit: userChannel doest Exist");
            return;
        }
        if (userChannel.mute !== null) {
            const date2Plus10Minutes = new Date(userChannel.mute);
            date2Plus10Minutes.setMinutes(userChannel.mute.getMinutes() + 1);
            if (date2Plus10Minutes > new Date()) {
                client.emit('Error', "ServerEmit: muted ");
                return;
            }
        }
        const message = {
            createdAt: new Date(),
            deletedAt: null,
            channelId: channelExists.id,
            userId: client.handshake['userId'],
            userName: payload.userName,
            invitation: false,
            channel: channelExists,
            message: payload.message
        };
        await this.chatService.createMessage(message);
        const messages = await this.chatService.getMessagesByChannelId(payload.channel_id);
        client.emit('AskRoomMessageOn', messages);
        this.server.emit('RefreshRoom');
    }

    @SubscribeMessage('playPongInvitation')
    async handlePlayPongInvitation(client: Socket, payload: any) {

        const channelExists = await this.chatService.findChannelById(payload.channelId);
        if (!channelExists) {
            client.emit('Error', "ServerEmit: channel doest Exist");
            return;
        }
        const userChannel = await this.chatService.findUserChannelByChannelByUserId(client.handshake['userId'], channelExists)
        if (userChannel === null) {
            client.emit('Error', "ServerEmit: userChannel doest Exist");
            return;
        }
        if (userChannel.duoChannel !== true) {
            client.emit('Error', "ServerEmit: Cannot invite frot public Channel doest Exist");
            return;
        }
        if (userChannel.mute !== null) {
            const date2Plus10Minutes = new Date(userChannel.mute);
            date2Plus10Minutes.setMinutes(userChannel.mute.getMinutes() + 1);
            if (date2Plus10Minutes > new Date()) {
                client.emit('Error', "ServerEmit: muted ");
                return;
            }
        }
        const message = {
            createdAt: new Date(),
            deletedAt: null,
            channelId: channelExists.id,
            userId: userChannel.userId,
            userName: userChannel.user.userName,
            channel: channelExists,
            invitation: true,
            message: "invitation send"
        };
        await this.chatService.createMessage(message);
        const messages = await this.chatService.getMessagesByChannelId(payload.channelId);
        client.emit('AskRoomMessageOn', messages);
        this.server.emit('RefreshRoom');
    }


    @SubscribeMessage('playPongAccept')
    async handlePlayPongAccept(client: Socket, payload: any) {

        const channelExists = await this.chatService.findChannelById(payload.channelId);
        if (!channelExists) {
            client.emit('Error', "ServerEmit: channel doest Exist");
            return;
        }
        const userChannel = await this.chatService.findUserChannelByChannelByUserId(client.handshake['userId'], channelExists)
        if (userChannel === null) {
            client.emit('Error', "ServerEmit: userChannel doest Exist");
            return;
        }
        if (userChannel.duoChannel !== true) {
            client.emit('Error', "ServerEmit: Cannot invite frot public Channel doest Exist");
            return;
        }
        if (userChannel.mute !== null) {
            const date2Plus10Minutes = new Date(userChannel.mute);
            date2Plus10Minutes.setMinutes(userChannel.mute.getMinutes() + 1);
            if (date2Plus10Minutes > new Date()) {
                client.emit('Error', "ServerEmit: muted ");
                return;
            }
        }
        this.chatService.deleteMessage(payload.message);
        const messages = await this.chatService.getMessagesByChannelId(payload.channelId);
        client.emit('AskRoomMessageOn', messages);
        this.server.emit('RefreshRoom');
    }



    @SubscribeMessage('createChannel')
    async handleCreateChannel(client: Socket, payload: any) {
        let password;
        if (payload.password !== undefined)
            password = encodePassword(payload.password);

        const channelAlreadyExist = await this.chatService.findChannelByChannelName(payload.channelName);
        if (payload.channelName.length > 10 || payload.channelName.length < 3 || channelAlreadyExist !== null) {
            client.emit('Error', "ServerEmit: Error Channel Params");
            return;
        }
        const user = await this.userService.findUser(client.handshake['userId']);
        const channel = {
            password: password,
            invitation: payload.invitation,
            channelName: payload.channelName,
            createdAt: new Date(),
        };
        await this.chatService.createChannel(channel);
        const channelFind = await this.chatService.findChannelByChannelName(payload.channelName);
        const userchannel = {
            owner: true,
            administrator: true,
            mute: null,
            createdAt: new Date(),
            channelId: channelFind.id,
            user: user,
            userId: user.userId,
            channel: channelFind,
        }
        await this.chatService.createUserChannel(userchannel);
        client.join(payload.channelName);
        this.server.to(payload.channelName).emit('RefreshRoom');
    }

    @SubscribeMessage('privateChannel')
    async handleCreatePrivateChannel(client: Socket, payload: any) {
        const user = await this.userService.findUser(client.handshake['userId']);
        const userTarget = await this.userService.findUser(payload.userTargetId);
        const userUserchannels = await this.chatService.findDuoUserChannelUserId(user.userId);

        if (userUserchannels !== null) {
            client.emit('Error', "ServerEmit: Duo room already create");
            return;
        }
        const channel = {
            invitation: payload.invitation,
            channelName: userTarget.userName + user.userName,
            duoChannel: true,
            createdAt: new Date(),
        };

        await this.chatService.createChannel(channel);
        const channelFind = await this.chatService.findChannelByChannelName(userTarget.userName + user.userName);
        const userchannel = {
            owner: false,
            administrator: false,
            duoChannel: true,
            mute: null,
            createdAt: new Date(),
            channelId: channelFind.id,
            user: user,
            userId: user.userId,
            channel: channelFind,
        }
        const userchannelTarget = {
            owner: false,
            administrator: false,
            mute: null,
            duoChannel: true,
            createdAt: new Date(),
            channelId: channelFind.id,
            user: userTarget,
            userId: userTarget.userId,
            channel: channelFind,
        }
        await this.chatService.createUserChannel(userchannel);
        await this.chatService.createUserChannel(userchannelTarget);
        client.join(userTarget.userName + user.userName);
        this.clientSocket.get(userTarget.userId).join(userTarget.userName + user.userName);
        this.server.to(userTarget.userName + user.userName).emit('RefreshRoom');
    }

    @SubscribeMessage('joinRoom')
    async handleJoinRoom(client: Socket, payload: any) {

        
        const channelExists = await this.chatService.findChannelByChannelName(payload.channelName);
        if(channelExists === null){
            client.emit('Error', "ServerEmit: channel doesnt exist");
            return;
        }
        const user = await this.userService.findUser(client.handshake['userId']);
        const UserchannelExist = await this.chatService.findUserChannelByChannelByUserId(client.handshake['userId'], channelExists);

        if (UserchannelExist !== null) {
            if (UserchannelExist.channel.deletedAt !== null && UserchannelExist.deletedAt !== null) {
                client.emit('Error', "ServerEmit: channel has been deleted");
                return;
            }
            if (UserchannelExist.channel.deletedAt === null && UserchannelExist.deletedAt !== null) {
                client.emit('Error', "ServerEmit: You have been banned from this channel");
                return;
            }
            client.emit('Error', "ServerEmit:Already in channel");
            return;

        }
        else if (channelExists.invitation === true) {
            client.emit('Error', "ServerEmit: private channel");
            return;
        }
        if (channelExists.password !== '') {
            if (payload.password === undefined ) {
                client.emit('Error', "ServerEmit:Please enter password");
                return;
            }
            const status = comparePassword(payload.password, channelExists.password);
            if (status == false) {
                client.emit('Error', "ServerEmit: WrongPassword");
                return;
            }
        }
        const userchannel = {
            owner: false,
            administrator: false,
            mute: null,
            createdAt: new Date(),
            channelId: channelExists.id,
            user: user,
            userId: user.userId,
            channel: channelExists,
        }
        await this.chatService.createUserChannel(userchannel);
        client.join(payload.channelName);
        this.server.emit('RefreshRoom');
    }
}