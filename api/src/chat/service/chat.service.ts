import { Injectable } from '@nestjs/common';
import { from } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Repository } from 'typeorm/repository/Repository';
import { messageEntity } from '../model/message.entity';
import { ChannelI, messageI } from '../model/chat.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'dns';
import { FindManyOptions, FindOneOptions, IsNull } from 'typeorm';
import { channelEntity } from '../model/channel.entity';
import { plainToClass } from 'class-transformer';
import { UserChannelEntity } from '../model/userchannel.entity';
import { UserChannelDto } from '../model/dto/userchannel.dto';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from 'src/user/services/user.service';
import { BlackListService } from 'src/blacklist/service/blacklist.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io'
@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(messageEntity)
        private readonly messageiRepository: Repository<messageEntity>,
        @InjectRepository(channelEntity)
        private readonly ChannelRepository: Repository<channelEntity>,
        @InjectRepository(UserChannelEntity)
        private readonly userChannelRepository: Repository<UserChannelEntity>,
        private userService: UserService,
        private jwtService: JwtService,
        private blackListService: BlackListService,
    ) { }

    createMessage(message: messageI): Promise<messageI> {
        return this.messageiRepository.save(message);
    }

    async deleteMessage(message: messageI) {
        await this.messageiRepository.update({ id: message.id }, { deletedAt: new Date() })
    }


    async findChannelByChannelName(channelName: string): Promise<channelEntity | undefined> {
        return await this.ChannelRepository.findOne({ where: { channelName: channelName, deletedAt: IsNull() } });
    }

    async findPublicChannel(): Promise<channelEntity[]> {
        return await this.ChannelRepository.find({ where: { invitation: false, password: '', deletedAt: IsNull() } });
    }


    async findUserChannelByChannelByUserIdOwner(userId: number, channel: ChannelI): Promise<UserChannelEntity> {
        return await this.userChannelRepository.findOne({ where: { userId: userId, channelId: channel.id, owner: true, deletedAt: IsNull() } })
    }


    async findUserChannelByChannelByUserId(userId: number, channel: ChannelI): Promise<UserChannelEntity> {
        return await this.userChannelRepository.findOne({
            relations: {
                channel: true,
                user: true,
            },
            where: { userId: userId, channelId: channel.id }
        })
    }

    async findUserChannelUserId(userId: number): Promise<UserChannelEntity[]> {
        return await this.userChannelRepository.find({
            relations: {
                channel: true
            },
            where: { userId: userId }
        })
    }

    async findDuoUserChannelUserId(userId: number): Promise<UserChannelEntity> {
        return await this.userChannelRepository.findOne({
            relations: {
                channel: true
            },
            where: { userId: userId, duoChannel: true }
        })
    }

    async deleteChannel(channelId: number, userId: number) {
        await this.ChannelRepository.update({ id: channelId }, { deletedAt: new Date() })
        await this.userChannelRepository.update({ userId: userId, channelId: channelId }, { deletedAt: new Date() })
    }

    async findUserChannel(): Promise<UserChannelEntity[]> {
        return await this.userChannelRepository.find({
            relations: {
                channel: true,
                user: true
            },
            where: {
                deletedAt: IsNull(), channel: { deletedAt: IsNull() }
            }
        });
    }

    async findChannelById(id: number) {
        return await this.ChannelRepository.findOne({ where: { id: id, deletedAt: null } });
    }
    async findAllChannels(): Promise<ChannelI[]> {
        return await this.ChannelRepository.find({ where: { password: IsNull(), deletedAt: IsNull() } });
    }

    async getMessagesByChannelId(roomId: number): Promise<messageEntity[]> {
        const channel = await this.ChannelRepository.findOneBy({ id: roomId, deletedAt: IsNull() });
        if (channel) {
            return await this.messageiRepository.find({
                relations: {
                    channel: true
                },
                where: {
                    channel: {
                        id: roomId
                    },
                    deletedAt: IsNull()
                }
            });
        }
    }

    async setPassword(userId: number, channelName: string, password: string): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const UserChannel = await this.userChannelRepository.findOne({ where: { userId: userId, channelId: channelExists.id, owner: true } })
        console.log(UserChannel);
        if (UserChannel !== undefined && channelExists !== undefined && UserChannel.duoChannel !== true){
            console.log("seeting true")
            await this.ChannelRepository.update({ id: channelExists.id }, { password: password })
        }
        else if (UserChannel.duoChannel === true)
            return 1
        return 0
    }



    async deletePassword(userId: number, channelName: string): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const UserChannel = await this.userChannelRepository.findOne({ where: { userId: userId, channelId: channelExists.id, owner: true } })
        if (UserChannel !== undefined && channelExists !== undefined && UserChannel.duoChannel !== true)
            await this.ChannelRepository.update({ id: channelExists.id }, { password: '' })
        else if (UserChannel.duoChannel === true)
            return 1
        return 0
    }

    async setPrivate(userId: number, channelName: string): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const UserChannel = await this.userChannelRepository.findOne({ where: { userId: userId, channelId: channelExists.id, owner: true } })
        if (UserChannel !== undefined && channelExists !== undefined && UserChannel.duoChannel !== true)
            await this.ChannelRepository.update({ id: channelExists.id }, { invitation: true })
        else if (UserChannel.duoChannel === true)
            return 1
        return 0
    }

    async setPublic(userId: number, channelName: string): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const UserChannel = await this.userChannelRepository.findOne({ where: { userId: userId,channelId:channelExists.id ,owner: true } })
        if (UserChannel !== undefined && channelExists !== undefined && UserChannel.duoChannel !== true)
            await this.ChannelRepository.update({ id: channelExists.id }, { invitation: false })
        else if (UserChannel.duoChannel === true)
            return 1
        return 0
    }

    async muteUser(channelName: string, userId: number, userTargetId: number): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const userTarget = await this.userService.findUser(userTargetId);
        const owner = await this.userService.findUser(userId);
        const UserChannelTarget = await this.userChannelRepository.findOne({ where: { userId: userTarget.userId, channelId: channelExists.id, owner: false } })
        const UserChannelOwner = await this.userChannelRepository.findOne({ where: { userId: owner.userId, channelId: channelExists.id, administrator: true } })

        if (UserChannelOwner !== null && UserChannelTarget !== null && channelExists !== undefined && owner !== undefined && userTarget !== undefined)
            this.userChannelRepository.update({ id: UserChannelTarget.id }, { mute: new Date() })
        else if (UserChannelOwner.duoChannel === true)
            return 1
        return 0
    }

    async BlacklistOn(channelName: string, userId: number, userTargetId: number): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const userTarget = await this.userService.findUser(userTargetId);
        const owner = await this.userService.findUser(userId);
        const UserChannelTarget = await this.userChannelRepository.findOne({ where: { userId: userTarget.userId, channelId: channelExists.id } })
        const UserChannelOwner = await this.userChannelRepository.findOne({ where: { userId: owner.userId, channelId: channelExists.id } })
        const blackListedOwner = await this.blackListService.getBlackListByUserId(owner.userId)

        if (UserChannelOwner !== null && UserChannelTarget !== null && channelExists !== undefined && owner !== undefined && userTarget !== undefined) {
            this.blackListService.blacklistCreate(owner, userTarget);
        }
        return 0
    }
    async BlacklistOff(channelName: string, userId: number, userTargetId: number): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const userTarget = await this.userService.findUser(userTargetId);
        const owner = await this.userService.findUser(userId);
        const UserChannelTarget = await this.userChannelRepository.findOne({ where: { userId: userTarget.userId, channelId: channelExists.id } })
        const UserChannelOwner = await this.userChannelRepository.findOne({ where: { userId: owner.userId, channelId: channelExists.id } })
        if (UserChannelOwner !== null && UserChannelTarget !== null && channelExists !== undefined && owner !== undefined && userTarget !== undefined) {
            this.blackListService.blacklistOff(owner, userTarget);
        }
        return 0
    }


    async setAdministrator(channelName: string, userId: number, userTargetId: number): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const userTarget = await this.userService.findUser(userTargetId);
        const owner = await this.userService.findUser(userId);
        const UserChannelTarget = await this.userChannelRepository.findOne({ where: { userId: userTarget.userId, channelId: channelExists.id } })
        const UserChannelOwner = await this.userChannelRepository.findOne({ where: { userId: owner.userId, channelId: channelExists.id, owner: true } })

        if (UserChannelOwner !== null && UserChannelTarget !== null && channelExists !== undefined && owner !== undefined && userTarget !== undefined && UserChannelTarget.duoChannel !== true)
            this.userChannelRepository.update({ id: UserChannelTarget.id }, { administrator: true })
        else if (UserChannelTarget.duoChannel === true)
            return 1
        return 0
    }

    async banUser(channelName: string, userId: number, userTargetId: number): Promise<number> {

        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const userTarget = await this.userService.findUser(userTargetId);
        const owner = await this.userService.findUser(userId);
        const UserChannelTarget = await this.userChannelRepository.findOne({ where: { userId: userTarget.userId, channelId: channelExists.id, owner: false } })
        const UserChannelOwner = await this.userChannelRepository.findOne({ where: { userId: owner.userId, channelId: channelExists.id, administrator: true } })
        if (UserChannelOwner !== null && UserChannelTarget !== null && channelExists !== undefined && owner !== undefined && userTarget !== undefined && UserChannelTarget.duoChannel !== true)
            this.userChannelRepository.update({ id: UserChannelTarget.id }, { deletedAt: new Date() })
        else if (UserChannelTarget.duoChannel === true)
            return 1
        return 0
    }


    async kickUser(channelName: string, userId: number, userTargetId: number): Promise<number> {
        const channelExists = await this.ChannelRepository.findOne({ where: { channelName: channelName } })
        const userTarget = await this.userService.findUser(userTargetId);
        const owner = await this.userService.findUser(userId);
        const UserChannelTarget = await this.userChannelRepository.findOne({ where: { userId: userTarget.userId, channelId: channelExists.id, owner: false } })
        const UserChannelOwner = await this.userChannelRepository.findOne({ where: { userId: owner.userId, channelId: channelExists.id, administrator: true } })
        if (UserChannelOwner !== null && UserChannelTarget !== null && channelExists !== undefined && owner !== undefined && userTarget !== undefined) {
            this.userChannelRepository.delete({ id: UserChannelTarget.id })
            return 0
        }
        if (UserChannelTarget.duoChannel === true)
            return 1
        else
            return 2

    }

    async createChannel(channel: ChannelI): Promise<ChannelI> {
        return await this.ChannelRepository.save(channel);
    }

    async createUserChannel(userchannel: UserChannelDto): Promise<UserChannelDto> {
        return await this.userChannelRepository.save(userchannel);
    }


}