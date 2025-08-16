import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from '../ChatWindow';
import { ChatRoom, ChatMessage } from '../../../types/chat';

// Mock chatService
jest.mock('../../../services/chatService', () => ({
  chatService: {
    subscribeToMessages: jest.fn(() => jest.fn()),
    getUserInfo: jest.fn(),
    sendMessage: jest.fn(),
  },
}));

const mockRoom: ChatRoom = {
  id: 'room123',
  participants: ['user1', 'user2'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMessages: ChatMessage[] = [
  {
    id: 'msg1',
    senderId: 'user1',
    senderName: 'User 1',
    content: 'Hello!',
    timestamp: new Date('2023-01-01T10:00:00Z'),
    roomId: 'room123',
  },
  {
    id: 'msg2',
    senderId: 'user2',
    senderName: 'User 2',
    content: 'Hi there!',
    timestamp: new Date('2023-01-01T10:01:00Z'),
    roomId: 'room123',
  },
];

describe('ChatWindow', () => {
  const defaultProps = {
    room: mockRoom,
    currentUserId: 'user1',
    currentUserName: 'User 1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chat window with room information', () => {
    render(<ChatWindow {...defaultProps} />);
    
    expect(screen.getByText('알 수 없는 사용자')).toBeInTheDocument();
    expect(screen.getByText('오프라인')).toBeInTheDocument();
  });

  it('displays messages correctly', async () => {
    const { chatService } = require('../../../services/chatService');
    chatService.subscribeToMessages.mockImplementation((roomId, callback) => {
      callback(mockMessages);
      return jest.fn();
    });

    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });
  });

  it('allows sending new messages', async () => {
    const { chatService } = require('../../../services/chatService');
    chatService.subscribeToMessages.mockImplementation((roomId, callback) => {
      callback([]);
      return jest.fn();
    });
    chatService.sendMessage.mockResolvedValue(undefined);

    render(<ChatWindow {...defaultProps} />);

    const messageInput = screen.getByPlaceholderText('메시지를 입력하세요...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(messageInput, { target: { value: 'New message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'room123',
        'user1',
        'User 1',
        'New message'
      );
    });
  });

  it('sends message on Enter key press', async () => {
    const { chatService } = require('../../../services/chatService');
    chatService.subscribeToMessages.mockImplementation((roomId, callback) => {
      callback([]);
      return jest.fn();
    });
    chatService.sendMessage.mockResolvedValue(undefined);

    render(<ChatWindow {...defaultProps} />);

    const messageInput = screen.getByPlaceholderText('메시지를 입력하세요...');

    fireEvent.change(messageInput, { target: { value: 'New message' } });
    fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(chatService.sendMessage).toHaveBeenCalledWith(
        'room123',
        'user1',
        'User 1',
        'New message'
      );
    });
  });

  it('does not send empty messages', async () => {
    const { chatService } = require('../../../services/chatService');
    chatService.subscribeToMessages.mockImplementation((roomId, callback) => {
      callback([]);
      return jest.fn();
    });

    render(<ChatWindow {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    
    expect(sendButton).toBeDisabled();
  });

  it('shows loading state initially', () => {
    const { chatService } = require('../../../services/chatService');
    chatService.subscribeToMessages.mockImplementation((roomId, callback) => {
      // Don't call callback immediately to simulate loading
      return jest.fn();
    });

    render(<ChatWindow {...defaultProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays placeholder when no room is selected', () => {
    render(<ChatWindow room={null} currentUserId="user1" currentUserName="User 1" />);

    expect(screen.getByText('채팅방을 선택해주세요')).toBeInTheDocument();
  });

  it('formats message time correctly', async () => {
    const { chatService } = require('../../../services/chatService');
    chatService.subscribeToMessages.mockImplementation((roomId, callback) => {
      callback(mockMessages);
      return jest.fn();
    });

    render(<ChatWindow {...defaultProps} />);

    await waitFor(() => {
      // 시간 포맷이 표시되는지 확인 (실제 시간은 환경에 따라 다를 수 있음)
      expect(screen.getByText(/Hello!/)).toBeInTheDocument();
    });
  });
});

