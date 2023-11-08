import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserI } from '../models/user.interface';
import * as jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { from, Observable } from 'rxjs';
import { toDataURL } from 'qrcode';

@Injectable()
export class UserService {
    jwtService: any;
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) { }

    async findOne(id: number): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { userId: id } })
    }
    async getTwofa(id: number): Promise<boolean> {
        return (await this.userRepository.findOne({ where: { userId: id } })).double_auth
    }

    createPost(UserI: UserI) {
        return from(this.userRepository.save(UserI));
    }

    async findAllPosts(): Promise<UserEntity[]> {
        return await this.userRepository.find();
    }

    async setStatus(userId: number, status: number) {
        await this.userRepository.update({ userId: userId }, { status: status });
    }


    async getStatus(userId: number): Promise<number> {
        const user = await this.userRepository.findOne({ where: { userId: userId } });
        return user.status;
    }


    updatePost(id: number, UserI: UserI): Observable<UpdateResult> {
        return from(this.userRepository.update(id, UserI))
    }

    async updateTwofa(req: any, updatedoubleAuth: boolean): Promise<any> {


        let user = await this.userRepository.findOne({ where: { userId: req.user.userId } })
        let generateTwoFactorAuthentication;
        if (updatedoubleAuth === true) {
            generateTwoFactorAuthentication = await this.generateTwoFactorAuthenticationSecret(user);
            user.twoFactorAuthenticationSecret = generateTwoFactorAuthentication.secret;
        }
        else
            user.twoFactorAuthenticationSecret = '';
        user.double_auth = updatedoubleAuth
        this.userRepository.save(user);
        if (updatedoubleAuth === true)
            return { doubleAuth: updatedoubleAuth, userSecret: generateTwoFactorAuthentication.secret, userName: user.userName };
        else
            return { doubleAuth: updatedoubleAuth }
    }

    deletePost(id: number): Observable<DeleteResult> {
        return from(this.userRepository.delete(id));
    }

    async getUserByUserName(userName: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { userName } });
    }

    async getUserByUserId(userId: number): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { userId } });
    }

    async haveUsername(name: string): Promise<boolean> {
        var a = 0;

        const data = await this.findAllPosts();
        while (a < data.length) {
            if (data[a].userName.toLowerCase() == name.toLowerCase()) return true;
            a++;
        }
        return false;
    }

    async usernameGenerator(): Promise<string> {
        var tabColor = [
            "red",
            "blue",
            "green",
            "yellow",
            "orange",
            "purple",
            "pink",
            "brown",
            "gray",
            "white",
            "black",
            "cyan",
            "magenta",
            "lime",
            "indigo",
            "violet",
            "gold",
            "silver",
            "bronze",
            "turquoise",
            "salmon",
            "lavender",
            "crimson",
            "amber",
            "ruby",
            "emerald",
            "sapphire",
            "pearl",
            "beige",
            "olive",
            "lemon",
            "peach",
            "charcoal",
            "navy",
            "scarlet",
            "mauve",
            "jade",
            "violet",
            "topaz",
            "copper",
            "fuchsia",
            "cobalt",
            "amaranth",
            "vermilion",
            "lilac",
        ];
        var tabAnimal = [
            "ant",
            "bat",
            "bee",
            "cat",
            "cow",
            "dog",
            "eel",
            "elk",
            "fox",
            "frog",
            "gazelle",
            "goat",
            "hawk",
            "kangaroo",
            "koala",
            "lion",
            "mole",
            "otter",
            "ox",
            "puma",
            "seal",
            "slug",
            "snail",
            "swan",
            "toad",
            "wolf",
            "bear",
            "bird",
            "duck",
            "fish",
            "frog",
            "hare",
            "hawk",
            "jaguar",
            "liger",
            "llama",
            "lynx",
            "macaw",
            "mink",
            "mouse",
            "newt",
            "panda",
            "parrot",
            "quail",
            "raven",
            "shark",
            "sheep",
            "skunk",
            "squid",
            "tiger",
            "whale",
            "zebra",
            "crab",
            "crow",
            "deer",
            "dolphin",
            "eagle",
            "ferret",
            "finch",
            "goose",
            "iguana",
            "lemur",
            "leech",
            "lemur",
            "monkey",
            "octopus",
            "ostrich",
            "panther",
            "pigeon",
            "python",
            "rabbit",
            "raccoon",
            "rat",
            "rhino",
            "salamander",
            "sardine",
            "snail",
            "spider",
            "viper",
            "weasel",
            "whale",
            "wombat",
        ];
        tabColor = tabColor.map(name => name.charAt(0).toUpperCase() + name.slice(1));
        tabAnimal = tabAnimal.map(name => name.charAt(0).toUpperCase() + name.slice(1));

        var name: string = tabColor[Math.floor(Math.random() * tabColor.length)] + tabAnimal[Math.floor(Math.random() * tabAnimal.length)];
        var a = 0;

        while (name.length > 16 || (await this.haveUsername(name))) {
            name = tabColor[Math.floor(Math.random() * tabColor.length)] + tabAnimal[Math.floor(Math.random() * tabAnimal.length)];
            a++;
        }
        return (name);
    }

    async createUser(userName: string): Promise<UserEntity> {
        const user = {
            userName: await this.usernameGenerator(),
            ftUser: userName,
            double_auth: false,
            elo: 1000,
            status: 1,
            createdAt: new Date(),
            deletedAt: null,
            channels: [],
            gamePlayerOne: [],
            gamePlayerTwo: [],
            userIdBL: [],
            targetIdBL: [],
            userIfriend: [],
            targetfriend: [],
        }
        return await this.userRepository.save(user);
    }

    async findUserIdByName(ftUser: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { ftUser } })
    }


    async findUserIdByuserName(userName: string): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { userName: userName } })
    }

    async findUser(userId: number): Promise<UserEntity> {
        return await this.userRepository.findOne({ where: { userId: userId } });
    }

    async generateTwoFactorAuthenticationSecret(user: UserEntity): Promise<any> {
        const secret = authenticator.generateSecret();

        const otpauthUrl = authenticator.keyuri(user.userName, user.userName, secret);

        await this.setTwoFactorAuthenticationSecret(secret, user.userId);

        return {
            secret,
            otpauthUrl
        }
    }

    async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        await this.userRepository.update({ userId: userId }, { twoFactorAuthenticationSecret: secret });
    }

    async generateQrCodeDataURL(otpAuthUrl: string) {
        return toDataURL(otpAuthUrl);
    }

    isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: UserEntity) {
        return authenticator.verify({
            token: twoFactorAuthenticationCode,
            secret: user.twoFactorAuthenticationSecret,
        });
    }

    async loginWith2fa(userWithoutPsw: Partial<UserEntity>) {
        const payload = {
            userName: userWithoutPsw.userName,
            isTwoFactorAuthenticationEnabled: !!userWithoutPsw.double_auth,
            isTwoFactorAuthenticated: true,
        };

        return {
            userName: payload.userName,
            access_token: this.jwtService.sign(payload),
        };
    }
}
