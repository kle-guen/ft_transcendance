import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { request } from 'express';
import { messageEntity } from 'src/chat/model/message.entity';
import { ChatService } from 'src/chat/service/chat.service';
import { UserI } from 'src/user/models/user.interface';
import { UserService } from 'src/user/services/user.service';

@Injectable()

export class AccessTokenService {

	connect: boolean = false;
	name: string | null = null;
	token: string | null = null;
	jwttoken: string | null = null;
	userName: string | null = null;
	ftUser: string | null = null;

	constructor(
		private jwtService: JwtService,
		private userService: UserService,
		private chatService: ChatService
	) { }

	async userExist(userName: string) {
		if (await this.userService.getUserByUserName(userName)) {
			return true;
		}
		return false;
	}

	async checkConnect(code: string): Promise<any> {
		const token: string = '';
		const data = new URLSearchParams();
		data.append('grant_type', 'authorization_code');
		data.append('client_id', process.env.CLIENT_ID);
		data.append('client_secret', process.env.CLIENT_SECRET);
		data.append('code', code);
		data.append('redirect_uri', 'http://localhost:4200/handleauth');

		await fetch('https://api.intra.42.fr/oauth/token', {
			method: 'POST',
			body: data
		})
			.then(response => response.json())
			.then(async data => {
				this.token = data.access_token;
				await fetch('https://api.intra.42.fr/v2/me', {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${data.access_token}`
					}
				})
					.then(response => response.json())
					.then(async data => {
						this.connect = true;
						this.name = data.login;
						if (await this.userService.findUserIdByName(this.name) === null) {
							await this.userService.createUser(this.name);
						}
						const userId = await this.userService.findUserIdByName(this.name);
						this.userName = userId.userName;
						this.ftUser = userId.ftUser
						const payload = { userId: userId.userId };
						this.jwttoken = this.jwtService.sign(payload)
					})
					.catch(error => console.error(error));
			})
			.catch(error => console.error(error));
		return { jwt: this.jwttoken, userName: this.userName ,ftUser: this.ftUser};
	}


	extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers['authorization']?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	async verifyJwt(token: string) {
		try {
			const payload = await this.jwtService.verifyAsync(
				token,
				{
					secret: process.env.JWT_SECRET
				}
			);
			// 💡 We're assigning the payload to the request object here
			// so that we can access it in our route handlers
			return request['user'] = payload;
		} catch {
			throw new UnauthorizedException();
		}
	}
}
