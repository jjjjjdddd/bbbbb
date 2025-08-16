import { ChatService } from '../chatService';
import { ChatMessage, ChatRoom, ChatUser } from '../../types/chat';

// Mock Firebase
jest.mock('../../config/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  where: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
}));

describe('ChatService', () => {
  let chatService: ChatService;

  beforeEach(() => {
    chatService = ChatService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ChatService.getInstance();
      const instance2 = ChatService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createChatRoom', () => {
    it('should create a chat room with participants', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      const mockDocRef = { id: 'room123' };
      mockAddDoc.mockResolvedValue(mockDocRef);

      const participants = ['user1', 'user2'];
      const result = await chatService.createChatRoom(participants);

      expect(result).toBe('room123');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          participants,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw error when creation fails', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      mockAddDoc.mockRejectedValue(new Error('Creation failed'));

      const participants = ['user1', 'user2'];
      
      await expect(chatService.createChatRoom(participants)).rejects.toThrow('Creation failed');
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      const mockUpdateDoc = require('firebase/firestore').updateDoc;
      const mockDoc = require('firebase/firestore').doc;
      
      mockAddDoc.mockResolvedValue({});
      mockUpdateDoc.mockResolvedValue({});
      mockDoc.mockReturnValue({});

      const roomId = 'room123';
      const senderId = 'user1';
      const senderName = 'Test User';
      const content = 'Hello, world!';

      await chatService.sendMessage(roomId, senderId, senderName, content);

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          roomId,
          senderId,
          senderName,
          content,
          timestamp: expect.any(Date),
        })
      );

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should throw error when sending message fails', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      mockAddDoc.mockRejectedValue(new Error('Send failed'));

      await expect(
        chatService.sendMessage('room123', 'user1', 'Test User', 'Hello')
      ).rejects.toThrow('Send failed');
    });
  });

  describe('getUserInfo', () => {
    it('should return user info when user exists', async () => {
      const mockDoc = require('firebase/firestore').doc;
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockExists = jest.fn();
      const mockData = jest.fn();

      mockDoc.mockReturnValue('docRef');
      mockGetDoc.mockResolvedValue({
        exists: mockExists,
        data: mockData,
      });
      mockExists.mockReturnValue(true);
      mockData.mockReturnValue({
        name: 'Test User',
        avatar: 'avatar.jpg',
        isOnline: true,
        lastSeen: new Date(),
      });

      const result = await chatService.getUserInfo('user123');

      expect(result).toEqual({
        id: 'user123',
        name: 'Test User',
        avatar: 'avatar.jpg',
        isOnline: true,
        lastSeen: expect.any(Date),
      });
    });

    it('should return null when user does not exist', async () => {
      const mockDoc = require('firebase/firestore').doc;
      const mockGetDoc = require('firebase/firestore').getDoc;
      const mockExists = jest.fn();

      mockDoc.mockReturnValue('docRef');
      mockGetDoc.mockResolvedValue({
        exists: mockExists,
      });
      mockExists.mockReturnValue(false);

      const result = await chatService.getUserInfo('user123');

      expect(result).toBeNull();
    });

    it('should return null when error occurs', async () => {
      const mockDoc = require('firebase/firestore').doc;
      const mockGetDoc = require('firebase/firestore').getDoc;

      mockDoc.mockReturnValue('docRef');
      mockGetDoc.mockRejectedValue(new Error('Get failed'));

      const result = await chatService.getUserInfo('user123');

      expect(result).toBeNull();
    });
  });
});
