import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.API_CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Allow clients to join a project-specific room
  @SubscribeMessage('joinProjectRoom')
  handleJoinProjectRoom(
    @MessageBody() projectId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (projectId) {
      const room = `project_${projectId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);
      return { event: 'joinedRoom', data: room };
    }
    return { event: 'error', data: 'No projectId provided' };
  }

  // Allow clients to leave a project-specific room
  @SubscribeMessage('leaveProjectRoom')
  handleLeaveProjectRoom(
    @MessageBody() projectId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (projectId) {
      const room = `project_${projectId}`;
      client.leave(room);
      this.logger.log(`Client ${client.id} left room: ${room}`);
      return { event: 'leftRoom', data: room };
    }
  }

  // Emit a message to a specific project room
  emitMessageToProject(projectId: string, eventName: string, payload: any) {
    this.server.to(`project_${projectId}`).emit(eventName, payload);
  }

  // Allow clients to join a user-specific room for notifications
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (userId) {
      const room = `user_${userId}`;
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);
      return { event: 'joinedUserRoom', data: room };
    }
  }

  // Broadcast to all connected clients
  broadcastAnnouncement(payload: any) {
    this.server.emit('systemAnnouncement', payload);
  }
}
