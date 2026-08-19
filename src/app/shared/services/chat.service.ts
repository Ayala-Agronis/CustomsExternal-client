import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { apiConfig } from '../../config/api-endpoints';
import { ChatMessage, ChatConversation } from '../models/chat.models';

declare var $: any;

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {
  private connection: any;
  private chatHubProxy: any;
  private connectionPromise?: Promise<void>;

  isConnected$ = new BehaviorSubject<boolean>(false);
  onMessageReceived?: (msg: ChatMessage) => void;

  constructor(private http: HttpClient) {}

  connect(): Promise<void> {
    if (this.connection && this.chatHubProxy && this.isConnected$.value) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    const signalRBaseUrl = apiConfig.customsdbSignalRUrl;

    const token =
      localStorage.getItem('authToken') || localStorage.getItem('token') || '';

    if (!token) {
      return Promise.reject('Missing auth token for SignalR');
    }

    console.log('SignalR base url:', signalRBaseUrl);

    this.connection = $.hubConnection(signalRBaseUrl);

    this.connection.qs = {
      access_token: token,
    };

    this.connection.logging = true;

    this.chatHubProxy = this.connection.createHubProxy('chatHub');

    this.chatHubProxy.on('addNewMessage', (serverMsg: any) => {
      const msg = this.mapMessage(serverMsg);
      this.onMessageReceived?.(msg);
    });

    this.chatHubProxy.on('newConversationOpened', (_conv: any) => {});

    this.chatHubProxy.on('conversationClosed', (conversationId: any) => {
      console.log('conversationClosed', conversationId);
    });

    this.connection.disconnected(() => {
      this.isConnected$.next(false);
      this.connectionPromise = undefined;
    });

    this.connectionPromise = new Promise((resolve, reject) => {
      this.connection
        .start()
        .done(() => {
          console.log('SignalR connected');
          this.isConnected$.next(true);
          resolve();
        })
        .fail((err: any) => {
          console.error('SignalR connection error:', err);
          this.isConnected$.next(false);
          this.connectionPromise = undefined;
          reject(err);
        });
    });

    return this.connectionPromise;
  }

  joinConversation(conversationId: string | number): Promise<void> {
    return this.connect().then(() => {
      if (!this.chatHubProxy) {
        return Promise.reject('SignalR hub is not connected');
      }

      return new Promise<void>((resolve, reject) => {
        this.chatHubProxy
          .invoke('JoinConversation', String(conversationId))
          .done(() => resolve())
          .fail((err: any) => reject(err));
      });
    });
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.stop();
    }

    this.isConnected$.next(false);
    this.connectionPromise = undefined;
    this.connection = undefined;
    this.chatHubProxy = undefined;
  }

  getExternalConversations(
    externalUserId: string,
    declarationId?: number | null,
  ): Observable<ChatConversation[]> {
    let url = `${apiConfig.customsdbApiUrl}chat/external-conversations?externalUserId=${encodeURIComponent(externalUserId)}`;

    const validDeclarationId =
      declarationId !== null &&
      declarationId !== undefined &&
      Number(declarationId) > 0;

    if (validDeclarationId) {
      url += `&declarationId=${Number(declarationId)}`;
    }

    return this.http
      .get<any[]>(url)
      .pipe(map((items) => items.map((c) => this.mapConversation(c))));
  }

  createConversation(
    externalUserId: string,
    subject: string,
    declarationId?: number | null,
  ): Observable<ChatConversation> {
    const validDeclarationId =
      declarationId !== null &&
      declarationId !== undefined &&
      Number(declarationId) > 0;

    return this.http
      .post<any>(`${apiConfig.customsdbApiUrl}chat/create`, {
        // ExternalUserId: externalUserId,

        Subject: subject,
        DeclarationId: validDeclarationId ? Number(declarationId) : null,
      })
      .pipe(map((c) => this.mapConversation(c)));
  }

  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    return this.http
      .post<any>(`${apiConfig.customsdbApiUrl}chat/send-message`, {
        ConversationId: message.conversationId,
        // SenderType: 1,
        // SenderUserId: message.senderUserId,

        MessageText: message.messageText,
      })
      .pipe(map((serverMsg) => this.mapMessage(serverMsg)));
  }

  getHistory(conversationId: number): Observable<ChatMessage[]> {
    return this.http
      .get<any[]>(`${apiConfig.customsdbApiUrl}chat/history/${conversationId}`)
      .pipe(map((msgs) => msgs.map((m) => this.mapMessage(m))));
  }

  mapConversation(c: any): ChatConversation {
    return {
      conversationId: c.conversationId ?? c.ConversationId,
      externalUserId: c.externalUserId ?? c.ExternalUserId,
      internalUserId: c.internalUserId ?? c.InternalUserId ?? null,
      declarationId: c.declarationId ?? c.DeclarationId ?? null,
      status: c.status ?? c.Status ?? 1,
      subject: c.subject ?? c.Subject ?? '',
      createdDate: c.createdDate
        ? new Date(c.createdDate)
        : c.CreatedDate
          ? new Date(c.CreatedDate)
          : undefined,
      lastMessageDate: c.lastMessageDate
        ? new Date(c.lastMessageDate)
        : c.LastMessageDate
          ? new Date(c.LastMessageDate)
          : undefined,
      closedDate: c.closedDate
        ? new Date(c.closedDate)
        : c.ClosedDate
          ? new Date(c.ClosedDate)
          : undefined,
      lastMessageText: c.lastMessageText ?? c.LastMessageText ?? '',
      lastSenderType: c.lastSenderType ?? c.LastSenderType ?? null,
      isClosed: c.isClosed ?? c.IsClosed ?? false,
      canWrite: c.canWrite ?? c.CanWrite ?? false,
      isCurrentDeclaration:
        c.isCurrentDeclaration ?? c.IsCurrentDeclaration ?? false,
      isGeneralToday: c.isGeneralToday ?? c.IsGeneralToday ?? false,
    };
  }

  mapMessage(m: any): ChatMessage {
    return {
      messageId: String(m.messageId ?? m.MessageId ?? ''),
      conversationId: String(m.conversationId ?? m.ConversationId ?? ''),
      messageText: m.messageText ?? m.MessageText ?? '',
      senderUserId: String(m.senderUserId ?? m.SenderUserId ?? ''),
      senderType: m.senderType ?? m.SenderType ?? 1,
      sentDate: m.sentDate ?? m.SentDate ?? '',
    };
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
