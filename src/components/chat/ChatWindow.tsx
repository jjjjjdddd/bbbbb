import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { ChatMessage, ChatRoom, ChatUser } from '../../types/chat';
import { chatService } from '../../services/chatService';

interface ChatWindowProps {
  room: ChatRoom | null;
  currentUserId: string;
  currentUserName: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  room,
  currentUserId,
  currentUserName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!room) {
      setMessages([]);
      setOtherUser(null);
      return;
    }

    setIsLoading(true);
    
    // 다른 참가자 정보 가져오기
    const otherId = room.participants.find(id => id !== currentUserId);
    if (otherId) {
      chatService.getUserInfo(otherId).then(user => {
        setOtherUser(user);
      });
    }

    // 메시지 구독
    const unsubscribe = chatService.subscribeToMessages(room.id, (chatMessages) => {
      setMessages(chatMessages);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [room, currentUserId]);

  useEffect(() => {
    // 새 메시지가 오면 스크롤을 맨 아래로
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!room || !newMessage.trim()) return;

    try {
      await chatService.sendMessage(room.id, currentUserId, currentUserName, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!room) {
    return (
      <Paper elevation={1} sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          채팅방을 선택해주세요
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <Avatar src={otherUser?.avatar} sx={{ mr: 2 }}>
          {otherUser?.name?.charAt(0) || '?'}
        </Avatar>
        <Box>
          <Typography variant="h6" component="h3">
            {otherUser?.name || '알 수 없는 사용자'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {otherUser?.isOnline ? '온라인' : '오프라인'}
          </Typography>
        </Box>
      </Box>

      {/* 메시지 영역 */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              
              return (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                      color: isOwnMessage ? 'white' : 'text.primary',
                      borderRadius: 2,
                      p: 1.5,
                      position: 'relative',
                    }}
                  >
                    {!isOwnMessage && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        {message.senderName}
                      </Typography>
                    )}
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.7,
                        textAlign: isOwnMessage ? 'right' : 'left',
                      }}
                    >
                      {formatMessageTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* 메시지 입력 영역 */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatWindow;

