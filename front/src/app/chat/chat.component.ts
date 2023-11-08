import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { CreateRoomComponent } from './create-room/create-room.component';
import { JoinRoomComponent } from './join-room/join-room.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { Router } from '@angular/router';
import {
  Blacklist,
  ChannelI,
  UserChannelI,
  messageI,
} from './interfaces/interfaces';
import { InviteUserComponent } from './invite-user/invite-user.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  constructor(
    private websocketService: WebsocketService,
    private cookieService: CookieService,
    public dialog: MatDialog,
    private router: Router
  ) { }

  username: string | null = '';
  ftUser: string | null = '';
  message: string = '';
  rooms: ChannelI[] = [];
  messages : messageI[] = [];
  privateRooms: ChannelI[] = [];
  publicRooms: ChannelI[] = [];
  blackListed: Blacklist[] = [];
  channelName: string = '';
  userId: number = 0;

  openDialogCreateRoom(): void {
    const dialogRef = this.dialog.open(CreateRoomComponent, {
      data: { name: this.username, rooms: this.publicRooms, invitation: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined) return;
      else {
        this.socket.emit('createChannel', {
          invitation: result.invitation,
          channelName: result.channelName,
          password: result.password,
        });
      }
    });
  }

  openDialogJoinRoom(): void {
    this.socket.emit('AskPublicRooms');
    const dialogRef = this.dialog.open(JoinRoomComponent, {
      data: { name: this.username, rooms: this.publicRooms, invitation: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined) return;
      else {
        this.socket.emit('joinRoom', {
          channelName: result.joinedchannelName,
          password: result.password,
        });
      }
    });
  }

  openDialogSetPassword(room: ChannelI): void {
    const dialogRef = this.dialog.open(SetPasswordComponent, {
      data: { name: this.username, rooms: this.publicRooms, invitation: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined) return;
      else {
        this.socket.emit('setPassword', {
          channelName: room.channelName,
          password: result.password,
        });
      }
    });
  }

  openDialogInviteUser(room: ChannelI): void {
    const dialogRef = this.dialog.open(InviteUserComponent, {
      data: { name: this.username, rooms: this.publicRooms, invitation: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined) return;
      else {
        this.socket.emit('inviteUser', {
          channelName: room.channelName,
          target: result.target,
        });
      }
    });
  }


  socket = this.websocketService.getSocket();
  selectedRoom: ChannelI | undefined;

  ngOnInit() {
    this.username = this.cookieService.get('userName');
    this.userId = Number(this.cookieService.get('userId'));

    this.socket.emit('AskPublicRooms');
    this.socket.on('AskPublicRoomsOn', (channels: ChannelI[]) => {
      this.publicRooms = [];
      channels.forEach((channel) => {
        const isDifferent = this.rooms.every(
          (room) => room.channelName !== channel.channelName
        );
        if (isDifferent) this.publicRooms.push(channel);
      });
    });

    this.socket.on('RefreshRoom', (data: any) => {
      if (data === null)
        return;
      this.socket.emit('blackListedUsersEmit');

      this.socket.emit('AskRoomEmit');
      if (this.selectedRoom !== undefined) {
        this.socket.emit('AskRoomMessageEmit', {
          channel_id: this.selectedRoom.id,
        });
      }
    });

    this.socket.on('AskRoomMessageOn', (data: messageI[]) => {
      if (data === null)
        return;
      data.forEach((message)=> {
        if(this.messages.find(messageId => messageId.id === message.id) === undefined)
        this.messages.push(message);
      })
      this.messages = data;
      const chatMessages = document.querySelector('.mat-drawer-content');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });

    this.socket.emit('blackListedUsersEmit');

    this.socket.on('blackListedUsersOn', (data: Blacklist[]) => {
      if (data === null)
        return;
      this.blackListed = data;
    });

    this.socket.emit('AskRoomEmit');
    this.socket.on('AskRoomOn',(channels: UserChannelI[], deleted: boolean) => {
        const selectedRoomName = this.selectedRoom?.channelName;
        this.rooms = [];
        channels.forEach((channels) => {
          if (this.userId === channels.userId) {
            const channel = channels.channel;
            if (this.rooms.find((rooms) => rooms.channelName === channel?.channelName) === undefined) {
              const channelI: ChannelI = {
                id: channel!.id,
                password: channel!.password,
                invitation: channel!.invitation,
                channelName: channel!.channelName,
                createdAt: channel!.createdAt,
                deletedAt: channel!.deletedAt,
                duoChannel: channels.duoChannel,
                userAdmins: [],
                userMuted: [],
                users: [],
                owner: 0,
              };
              this.rooms.push(channelI);
            }
          }
        });

        let i = 0;
        while (channels.length > i) {
          if (channels[i].owner === true && this.rooms.find((room) => room.owner === 0)) {
            const channelfind = this.rooms.find((channel) => channel.channelName === channels[i].channel?.channelName);
            if (channelfind !== undefined)
              channelfind.owner = channels[i].user.userId;
          }
          if (channels[i].administrator === true) {
            const room = this.rooms.find((room) => room.channelName === channels[i].channel?.channelName);

            if (room && room.userAdmins !== undefined && !room.userAdmins.some((userAdmins) => userAdmins === channels[i].user.userId)) {
              const channelfind = this.rooms.find((channel) => channel.channelName === channels[i].channel?.channelName);
              if (channelfind !== undefined && channelfind.userAdmins !== undefined && channelfind !== undefined)
                channelfind.userAdmins.push(channels[i].userId);
            }
          }
          if (channels[i].mute !== null) {
            const room = this.rooms.find((room) => room.channelName === channels[i].channel?.channelName);

            if (room && room.userAdmins !== undefined && !room.userMuted.some((userMuted) => userMuted === channels[i].user.userId)) {
              const muteDate = new Date(channels[i].mute);
              const now = new Date();
              const tenMinutesFromNow = new Date(muteDate.getTime() + 1 * 60 * 1000);
              if (tenMinutesFromNow >= now && this.rooms[i] != undefined) {
                this.rooms[i].userMuted.push(channels[i].userId);
              }
            }
          }
          const room = this.rooms.find((room) => room.channelName === channels[i].channel?.channelName);

          // Vérifier si la salle existe et si l'utilisateur n'est pas déjà présent dans la liste
          if (room && !room.users.some((user) => user.userId === channels[i].user.userId)) {
            room.users.push(channels[i].user);
          }
          i++;
        }

        if (this.rooms.length > 0 && this.selectedRoom === null) {
          this.selectedRoom = this.rooms[0];
        }
        else if (this.rooms.find((room) => room.channelName == selectedRoomName) !== undefined)
          this.selectedRoom = this.rooms.find((room) => room.channelName == selectedRoomName);
        else if (this.privateRooms.find((room) => room.channelName == selectedRoomName) !== undefined)
          this.selectedRoom = this.privateRooms.find((room) => room.channelName == selectedRoomName);

        this.rooms.forEach((room, index) => {
          if (room.duoChannel === true) {
            if (this.privateRooms.find((privateRooms) => privateRooms.channelName === room.channelName) === undefined)
              this.privateRooms.push(room); // Ajoutez le canal à la liste des canaux duo
            this.rooms.splice(index, 1); // Supprimez le canal de la liste principale
          }
        });

        if (this.rooms.length > 0 && this.selectedRoom === null) {
          this.selectedRoom = this.rooms[0];
        }
        else if (this.rooms.find((room) => room.channelName == selectedRoomName) !== undefined)
          this.selectedRoom = this.rooms.find((room) => room.channelName == selectedRoomName);
        else if (
          this.privateRooms.find((room) => room.channelName == selectedRoomName) !== undefined)
          this.selectedRoom = this.privateRooms.find((room) => room.channelName == selectedRoomName);
        const chatMessages = document.querySelector('.mat-drawer-content');

        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }

    );
    this.socket.on('Error', (string: string) => { 
      alert(string);
    });
  }

  isUserBlacklisted(userName: string) {
    const userBlocked = this.blackListed.find(
      (blacklist) => blacklist.blackListedUserTarget.userName === userName
    );
    if (userBlocked?.deletedAt === null) return true;
    return false;
  }

  sendMessage() {
    if (this.message.trim() === '') {
      return;
    } else if (!this.selectedRoom) {
      return;
    }
    this.socket.emit('messageEmit', {
      userName: this.username,
      ftUser: this.username,
      message: this.message,
      channel_id: this.selectedRoom.id,
      channelName: this.selectedRoom.channelName,
    });
    this.message = '';

    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  selectRoom(room: ChannelI) {
    this.selectedRoom = room;
    this.socket.emit('AskRoomMessageEmit', {
      channel_id: this.selectedRoom.id,
    });
  }

  keyDownFunction(event: { keyCode: number }) {
    if (event.keyCode === 13) {
      this.sendMessage();
    }
    this.message = '';
  }

  deleteRoom(room: ChannelI) {
    this.socket.emit('deleteChannel', { channel: room });
  }

  deletePassword(room: ChannelI) {
    this.socket.emit('deletePassword', { channelName: room.channelName });
  }

  muteUser(channelName: string | undefined, userId: number | undefined) {
    if (channelName === undefined || userId === undefined) {
      return;
    }
    this.socket.emit('muteUser', {
      channelName: channelName,
      userTargetId: userId,
    });
  }

  setPrivate(room: ChannelI) {
    this.socket.emit('setPrivate', { channelName: room.channelName });
  }

  setPublic(room: ChannelI) {
    this.socket.emit('setPublic', { channelName: room.channelName });
  }

  onMessageChange(event: any) {
    this.message = event.target.value;
  }

  setAdministrator(
    channelName: string | undefined,
    userId: number | undefined
  ) {
    this.socket.emit('setAdministrator', {
      channelName: channelName,
      userTargetId: userId,
    });
  }

  banUser(channelName: string | undefined, userId: number | undefined) {
    this.socket.emit('banUser', {
      channelName: channelName,
      userTargetId: userId,
    });
  }

  kickUser(channelName: string | undefined, userId: number | undefined) {
    this.socket.emit('kickUser', {
      channelName: channelName,
      userTargetId: userId,
    });
  }

  BlacklistOn(channelName: string | undefined, userId: number | undefined) {
    this.socket.emit('BlacklistOn', {
      channelName: channelName,
      userTargetId: userId,
    });
  }

  async playPong(channelId: number, userId: number | undefined) {
    await this.router.navigate(['/classicpong'], {
      queryParams: { type: 'private' },
    });
    this.socket.emit('playPongInvitation', {
      channelId: channelId,
      userTargetId: userId,
    });
    this.socket.emit('joinPrivateGame', {
      roomName: 'private-match-' + this.userId.toString(),
      playerOneId: this.userId,
      playerTwoId: userId,
      action: 'create',
      mode: 'classic',
    });
  }

  async playPongAccept(channelId: number, userId: number, message: messageI) {
    await this.router.navigate(['/classicpong'], {
      queryParams: { type: 'private' },
    });
    this.socket.emit('playPongAccept', {
      userTargetId: userId,
      channelId: channelId,
      message: message,
    });
    this.socket.emit('joinPrivateGame', {
      roomName: 'private-match-' + userId.toString(),
      playerOneId: userId,
      playerTwoId: this.userId,
      action: 'join',
      mode: 'classic',
    });
  }

  playPongDenie(channelId: number | undefined, userId: number | undefined, message: messageI) { 
    this.socket.emit('playPongAccept', {
      userTargetId: userId,
      channelId: channelId,
      message: message,
    });
  }

  BlacklistOff(channelName: string | undefined, userId: number | undefined) {
    this.socket.emit('BlacklistOff', {
      channelName: channelName,
      userTargetId: userId,
    });
  }

  privateChannel(userId: number | undefined) {
    this.socket.emit('privateChannel', { userTargetId: userId });
  }

  userProfile(userName: string | undefined) {
    this.router.navigate(['/profile'], {
      queryParams: { profile: userName },
    });
  }

  onRoomChange(event: any) {
    this.channelName = event.target.value;
  }
}
