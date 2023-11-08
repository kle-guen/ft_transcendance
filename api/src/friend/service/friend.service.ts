import { Injectable } from '@nestjs/common';
import { FriendEntity } from '../model/friend.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FriendDto } from '../model/friend.dto';
import { UserEntity } from 'src/user/models/user.entity';
import { from, Observable } from 'rxjs';

@Injectable()
export class FriendService {

	constructor(
		@InjectRepository(FriendEntity)
		private readonly FriendRepository: Repository<FriendEntity>
	) { }

	async FriendCreate(owner: UserEntity, userTarget: UserEntity): Promise<FriendEntity> {
		const test = {
			createdAt: new Date,
			deletedAt: null,
			isAccept: false,
			friendUser: owner,
			friendUserTarget: userTarget,
		};
		return await this.FriendRepository.save(test);
	}


	async FriendOn(owner: UserEntity, userTarget: UserEntity){
		const FriendRepo =  await this.FriendRepository.update({ friendUserTargetId: userTarget.userId, friendUserId: owner.userId}, { deletedAt: new Date() });
	}

	async FriendOff(owner: UserEntity, userTarget: UserEntity){
		const FriendRepo =  await this.FriendRepository.delete({ friendUserTargetId: userTarget.userId, friendUserId: owner.userId});
	}

	async getFriendByUserId(userId: number): Promise<FriendEntity[]> {

		return await this.FriendRepository.find({
			relations: {
				friendUser: true,
				friendUserTarget:true,
			},
			where: { friendUserId: userId }
		})
	}

	findAllPosts():Observable<FriendDto[]> {
        return from(this.FriendRepository.find());
    }

    updatePost(id:number , FriendDto: FriendDto): Observable<UpdateResult> {
        return from(this.FriendRepository.update(id,FriendDto))
    }

    deletePost(id:number): Observable<DeleteResult> {
        return from(this.FriendRepository.delete(id));
    }

	createPost(FriendDto: FriendDto) {
        return from(this.FriendRepository.save(FriendDto));
    }
}
