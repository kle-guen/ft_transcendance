import { Request, Controller, Body, Post, Get, Query, HttpCode, HttpException, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AccessTokenService } from '../service/access_token.service';
import { UserService } from 'src/user/services/user.service';
import * as jwt from 'jsonwebtoken';
import { Public } from 'src/utils/publicDecorator';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AccessTokenController {

    constructor(private accessTokenService: AccessTokenService, private userService: UserService) {
    }

    @Public()
    @Post('access-token')
    async receiveAccessToken(@Query("code") code: string, @Body() body): Promise<any> {
        const token = await this.accessTokenService.checkConnect(code);
        if (!token)
            return true
        const decodedToken = jwt.verify(token.jwt, process.env.JWT_SECRET) as { userId: number }; // Assurez-vous que userId est correctement typé
        const userId = decodedToken.userId;
        const user = await this.userService.findUser(userId)
        if (await this.userService.getTwofa(userId) === true){
            const isCodeValid = this.userService.isTwoFactorAuthenticationCodeValid(
                body.message,
                user,
            );
            if(isCodeValid !== true)
                return true
        }
        return token;
    }

    @Public()
    @Get('verify')
    async receiveVerify(@Request() req): Promise<boolean> {
        const token = await this.accessTokenService.verifyJwt(this.accessTokenService.extractTokenFromHeader(req));
        if (!token)
            return true
        const userId = token.userId;
        const user = await this.userService.findUser(userId)
        if(!user)
            return false
        return true;
    }
}
