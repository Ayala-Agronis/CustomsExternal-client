import {
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatService } from '../../services/chat.service';
import {
  ChatConversation,
  ChatConversationWithMessages,
  ChatMessage,
} from '../../models/chat.models';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss'],
})
export class ChatWidgetComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // חבר מדף ההצהרה: <app-chat-widget [declarationId]="declaration.id" />
  @Input() declarationId: number | null = null;

  isOpen = false;
  messageText = '';
  loadingHistory = false;
  draftMode = false;

  conversationGroups: ChatConversationWithMessages[] = [];
  selectedConversationId: number | null = null;

  get externalUserId(): string {
    return localStorage.getItem('userId') || '';
  }

  get selectedGroup(): ChatConversationWithMessages | undefined {
    return this.conversationGroups.find(
      (g) =>
        Number(g.conversation.conversationId) === this.selectedConversationId,
    );
  }

  get selectedConversation(): ChatConversation | undefined {
    return this.selectedGroup?.conversation;
  }

  get selectedMessages(): ChatMessage[] {
    return this.selectedGroup?.messages ?? [];
  }

  get canWrite(): boolean {
    if (this.draftMode) return true;
    if (!this.selectedConversation) return true;
    return !!this.selectedConversation.canWrite;
  }

  get inputDisabled(): boolean {
    if (this.draftMode) return false;
    if (!this.selectedConversation) return false;
    return !this.selectedConversation.canWrite;
  }

  constructor(
    public chatService: ChatService,
    private zone: NgZone,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['declarationId'] && !changes['declarationId'].firstChange && this.isOpen) {
      this.stopAutoRefresh();
      this.loadExternalChatContext();
      this.startAutoRefresh();
    }
  }

  ngOnInit(): void {
    this.chatService.onMessageReceived = (msg: ChatMessage) => {
      this.zone.run(() => {
        // הודעה שהלקוח עצמו שלח כבר מוצגת מיד ב-Optimistic UI,
        // לכן לא מוסיפים אותה שוב דרך SignalR.
        if (
          msg.senderType === 1 &&
          String(msg.senderUserId) === String(this.externalUserId)
        ) {
          return;
        }

        const convId = String(msg.conversationId);

        const group = this.conversationGroups.find(
          (g) => String(g.conversation.conversationId) === convId,
        );

        if (!group) {
          return;
        }

        const alreadyExists = group.messages.some(
          (m) =>
            m.messageId &&
            msg.messageId &&
            String(m.messageId) === String(msg.messageId),
        );

        if (alreadyExists) {
          return;
        }

        group.messages = [...group.messages, msg];

        group.conversation.lastMessageText = msg.messageText;
        group.conversation.lastMessageDate = msg.sentDate
          ? new Date(msg.sentDate)
          : new Date();

        if (String(this.selectedConversationId) === convId) {
          this.scrollToBottom();
        }
      });
    };
  }

  private refreshTimer?: any;

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.loadExternalChatContext();
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      if (!this.isOpen || this.draftMode) return;
      this.loadExternalChatContext(true);
    }, 60000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private loadExternalChatContext(keepSelected = false): void {
    if (!this.externalUserId) return;

    const previousSelectedId = this.selectedConversationId;
    const wasAtBottom = this.isAtBottom();

    if (!keepSelected) {
      this.loadingHistory = true;
      this.conversationGroups = [];
      this.selectedConversationId = null;
      this.draftMode = false;
    }

    this.chatService
      .getExternalConversations(this.externalUserId, this.declarationId)
      .pipe(catchError(() => of([])))
      .subscribe((conversations) => {
        if (conversations.length === 0) {
          if (!keepSelected) {
            this.loadingHistory = false;
          }
          return;
        }

        // ברענון אוטומטי — שמור היסטוריה קיימת, טען רק שיחות חדשות
        const historyRequests = conversations.map((c) => {
          if (keepSelected) {
            const existing = this.conversationGroups.find(
              (g) => String(g.conversation.conversationId) === String(c.conversationId)
            );
            if (existing) return of(existing.messages);
          }
          return this.chatService
            .getHistory(Number(c.conversationId))
            .pipe(catchError(() => of([])));
        });

        forkJoin(historyRequests).subscribe((allHistories) => {
          this.conversationGroups = conversations.map((conv, i) => ({
            conversation: conv,
            messages: allHistories[i],
          }));

          // בחירת שיחה נבחרת
          if (keepSelected && previousSelectedId) {
            const stillExists = conversations.some(
              (c) => Number(c.conversationId) === previousSelectedId
            );
            this.selectedConversationId = stillExists ? previousSelectedId : this.pickBest(conversations);
          } else {
            this.selectedConversationId = this.pickBest(conversations);
          }

          const selected = conversations.find(
            (c) => Number(c.conversationId) === this.selectedConversationId
          );
          if (selected?.canWrite) {
            this.connectToConversation(this.selectedConversationId!);
          }

          if (!keepSelected) {
            this.loadingHistory = false;
            this.scrollToBottom();
          } else if (wasAtBottom) {
            this.scrollToBottom();
          }
        });
      });
  }

  private pickBest(conversations: ChatConversation[]): number | null {
    if (conversations.length === 0) return null;
    const writable = conversations.filter((c) => c.canWrite);
    const pool = writable.length > 0 ? writable : conversations;
    const best = pool.reduce((a, b) =>
      (b.lastMessageDate ?? b.createdDate ?? new Date(0)) >
      (a.lastMessageDate ?? a.createdDate ?? new Date(0)) ? b : a
    );
    return Number(best.conversationId);
  }

  selectConversation(conversationId: number | null): void {
    this.draftMode = false;

    if (conversationId === null) {
      this.selectedConversationId = null;
      this.scrollToBottom();
      return;
    }

    this.selectedConversationId = Number(conversationId);

    const conv = this.selectedConversation;

    if (this.selectedConversationId && !conv?.isClosed) {
      this.connectToConversation(this.selectedConversationId);
    }

    this.scrollToBottom();
  }

  send(): void {
    if (!this.messageText.trim()) return;

    if (
      !this.draftMode &&
      this.selectedConversation?.canWrite &&
      this.selectedConversationId
    ) {
      this.doSend(this.selectedConversationId);
      return;
    }

    this.createAndSend();
  }

  private createAndSend(): void {
    const subject =
      this.declarationId && Number(this.declarationId) > 0
        ? `פנייה עבור הצהרה ${this.declarationId}`
        : 'פנייה חדשה';

    const validDeclarationId =
      this.declarationId !== null &&
      this.declarationId !== undefined &&
      Number(this.declarationId) > 0;

    this.chatService
      .createConversation(
        this.externalUserId,
        subject,
        validDeclarationId ? Number(this.declarationId) : null,
      )
      .subscribe((conversation) => {
        const id = Number(conversation.conversationId);

        if (!id || isNaN(id)) {
          console.error('לא התקבל ConversationId תקין', conversation);
          return;
        }

        conversation.canWrite = true;
        conversation.isClosed = false;
        conversation.status = 1;

        this.conversationGroups = [
          ...this.conversationGroups,
          {
            conversation,
            messages: [],
          },
        ];

        this.draftMode = false;
        this.selectedConversationId = id;

        this.connectToConversation(id);
        this.doSend(id);
      });
  }

  private doSend(conversationId: number): void {
    const text = this.messageText.trim();

    if (!text) {
      return;
    }

    const tempId = `temp-${Date.now()}`;

    const optimisticMsg: ChatMessage = {
      messageId: tempId,
      conversationId,
      senderType: 1,
      senderUserId: this.externalUserId,
      messageText: text,
      sentDate: new Date(),
    };

    const group = this.conversationGroups.find(
      (g) => String(g.conversation.conversationId) === String(conversationId),
    );

    if (group) {
      group.messages = [...group.messages, optimisticMsg];
      group.conversation.lastMessageText = text;
      group.conversation.lastMessageDate = new Date();
    }

    this.messageText = '';
    this.scrollToBottom();

    const msg: ChatMessage = {
      conversationId,
      senderType: 1,
      senderUserId: this.externalUserId,
      messageText: text,
    };

    this.chatService.sendMessage(msg).subscribe({
      next: (serverMsg) => {
        const currentGroup = this.conversationGroups.find(
          (g) =>
            String(g.conversation.conversationId) ===
            String(serverMsg.conversationId),
        );

        if (!currentGroup) {
          return;
        }

        const realAlreadyExists = currentGroup.messages.some(
          (m) =>
            m.messageId &&
            serverMsg.messageId &&
            String(m.messageId) === String(serverMsg.messageId),
        );

        if (realAlreadyExists) {
          // אם ההודעה האמיתית כבר נכנסה דרך SignalR,
          // מוחקים רק את ההודעה הזמנית
          currentGroup.messages = currentGroup.messages.filter(
            (m) => String(m.messageId) !== tempId,
          );
        } else {
          // מחליפים את ההודעה הזמנית בהודעה האמיתית מהשרת
          currentGroup.messages = currentGroup.messages.map((m) =>
            String(m.messageId) === tempId ? serverMsg : m,
          );
        }

        currentGroup.conversation.status = 2;
        currentGroup.conversation.canWrite = true;
        currentGroup.conversation.isClosed = false;
        currentGroup.conversation.lastMessageDate = serverMsg.sentDate
          ? new Date(serverMsg.sentDate)
          : new Date();
        currentGroup.conversation.lastMessageText = serverMsg.messageText;

        this.scrollToBottom();
      },

      error: (err) => {
        console.error('שגיאה בשליחת הודעה', err);

        const currentGroup = this.conversationGroups.find(
          (g) =>
            String(g.conversation.conversationId) === String(conversationId),
        );

        if (currentGroup) {
          currentGroup.messages = currentGroup.messages.filter(
            (m) => String(m.messageId) !== tempId,
          );
        }

        this.messageText = text;
        this.loadExternalChatContext();
      },
    });
  }

  startNewConversation(): void {
    // לא יוצרים שיחה ב-DB עדיין.
    // רק עוברים למצב טיוטה במסך.
    // השיחה תיווצר בפועל רק כשישלחו הודעה ראשונה.
    this.draftMode = true;
    this.selectedConversationId = null;
    this.messageText = '';

    setTimeout(() => {
      this.scrollToBottom();
    });
  }

  getConversationTitle(conversation: ChatConversation): string {
    const base = conversation.declarationId
      ? `פנייה עבור הצהרה ${conversation.declarationId}`
      : 'פנייה כללית';
    const status = conversation.isClosed ? ' · נסגרה' : ' · פעילה';
    return base + status;
  }

  private connectToConversation(conversationId: string | number): void {
    this.chatService
      .connect()
      .then(() => this.chatService.joinConversation(String(conversationId)))
      .catch((err) => console.error('SignalR connection error:', err));
  }

  private isAtBottom(): boolean {
    if (!this.messagesContainer) return true;
    const el = this.messagesContainer.nativeElement;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    this.chatService.onMessageReceived = undefined;
    this.chatService.disconnect();
  }
}
