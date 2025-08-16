import { ChatMessage, ChatRoom, ChatUser } from '../types/chat';
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  serverTimestamp,
  Timestamp,
  getDoc
} from 'firebase/firestore';

export class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // 채팅방 생성
  async createChatRoom(participants: string[]): Promise<string> {
    try {
      const roomData = {
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'chatRooms'), roomData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  // 메시지 전송
  async sendMessage(roomId: string, senderId: string, senderName: string, content: string): Promise<void> {
    try {
      const messageData = {
        roomId,
        senderId,
        senderName,
        content,
        timestamp: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'messages'), messageData);
      
      // 채팅방 업데이트 시간 갱신
      await updateDoc(doc(db, 'chatRooms', roomId), {
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // 채팅방 목록 구독
  subscribeToChatRooms(userId: string, callback: (rooms: ChatRoom[]) => void): () => void {
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        rooms.push({
          id: doc.id,
          participants: data.participants,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      callback(rooms);
    });

    return unsubscribe;
  }

  // 메시지 목록 구독
  subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          roomId: data.roomId,
        });
      });
      callback(messages);
    });

    return unsubscribe;
  }

  // 사용자 정보 가져오기
  async getUserInfo(userId: string): Promise<ChatUser | null> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userData = await getDoc(userDocRef);
      
      if (userData.exists()) {
        const data = userData.data();
        return {
          id: userId,
          name: data?.name || 'Unknown User',
          avatar: data?.avatar,
          isOnline: data?.isOnline || false,
          lastSeen: data?.lastSeen?.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }
}

export const chatService = ChatService.getInstance();
