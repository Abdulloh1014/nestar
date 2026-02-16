import { Logger } from '@nestjs/common';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import * as WebSocket from "ws"; 

interface MessagePayload {
  event: string;
  text: string;
}

interface InfoPayload {
  event: string;
  totalClients: number;
}

@WebSocketGateway({ tranports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('SocketEventsGateway');
  private summanryClient: number = 0;

  @WebSocketServer()
  server: Server;
  
  public afterInit(server: Server) {
      this.logger.verbose(`WebSocket Server Initializedn & total [${this.summanryClient}]`)
  }

  handleConnection(client: WebSocket, ...args: any[]) {
    this.summanryClient++;
    this.logger.verbose(`Connection total [${this.summanryClient}] `);

    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.summanryClient,
    };
    this.emitMessage(infoMsg);

  }


  handleDisconnect(client: WebSocket) {
    this.summanryClient--;
    this.logger.verbose(`Disconnection total [${this.summanryClient}] `);

    const infoMsg: InfoPayload = {
      event: 'info',
      totalClients: this.summanryClient,
    };
    this.broadcastMessage(client, infoMsg);
  }

@SubscribeMessage('message')
public async handleMessage(client: WebSocket, payload: string ): Promise<void> {
  const newMessage: MessagePayload = {event: 'message', text: payload };

  this.logger.verbose(`NEW MESSAGE: ${payload}`);
  this.emitMessage(newMessage);
}

  private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client !== sender && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private emitMessage(message: InfoPayload | MessagePayload) {
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

}
