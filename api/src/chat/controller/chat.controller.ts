import { Request,Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/access_token/jwt-auth.guard';
import { UserService } from 'src/user/services/user.service';
import { ChatGateway } from '../gateway/chatGateway';

@Controller('chat')
export class ChatController {

}
