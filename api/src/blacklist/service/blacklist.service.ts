import { Injectable } from '@nestjs/common';
import { BlackListEntity } from '../model/blacklist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BlacklistDto } from '../model/blacklist.dto';
import { UserEntity } from 'src/user/models/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { from, Observable } from 'rxjs';

@Injectable()
export class BlackListService {

	constructor(
		@InjectRepository(BlackListEntity)
		private readonly blackListRepository: Repository<BlackListEntity>
	) { }

	async blacklistCreate(owner: UserEntity, userTarget: UserEntity){
		const status = await this.findBlockedUser(owner, userTarget);
		if (status === null) {
			const test = {
				createdAt: new Date,
				deletedAt: null,
				blackListedUser: owner,
				blackListedUserTarget: userTarget,
			};
			this.blackListRepository.save(test);
		}
	}


	async blacklistOff(owner: UserEntity, userTarget: UserEntity) {
		const blacklistRepo = await this.blackListRepository.delete({ blackListedUserTargetId: userTarget.userId, blackListedUserId: owner.userId });
	}

	async getBlackListByUserId(userId: number): Promise<BlackListEntity[]> {

		return await this.blackListRepository.find({
			relations: {
				blackListedUser: true,
				blackListedUserTarget: true,
			},
			where: { blackListedUserId: userId }
		})
	}

	async findBlockedUser(owner: UserEntity, userTarget: UserEntity): Promise<BlackListEntity> {

		const blacklistRepo = await this.blackListRepository.findOne({
			where: {
				blackListedUserId: owner.userId,
				blackListedUserTargetId: userTarget.userId
			}
		})
		return blacklistRepo;
	}

	findAllPosts(): Observable<BlacklistDto[]> {
		return from(this.blackListRepository.find());
	}

	updatePost(id: number, BlacklistDto: BlacklistDto): Observable<UpdateResult> {
		return from(this.blackListRepository.update(id, BlacklistDto))
	}

	deletePost(id: number): Observable<DeleteResult> {
		return from(this.blackListRepository.delete(id));
	}

	createPost(BlacklistDto: BlacklistDto) {
		return from(this.blackListRepository.save(BlacklistDto));
	}
}
