import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
  Paper,
} from '@mui/material';
import { ChatRoom, ChatUser } from '../../types/chat';
import { chatService } from '../../services/chatService';

interface ChatRoomListProps {
  currentUserId: string;
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId?: string;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({
  currentUserId,
  onRoomSelect,
  selectedRoomId,
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<Map<string, ChatUser>>(new Map());

  useEffect(() => {
    const unsubscribe = chatService.subscribeToChatRooms(currentUserId, (chatRooms) => {
      setRooms(chatRooms);
      
      // 참가자 정보 가져오기
      const participantIds = new Set<string>();
      chatRooms.forEach(room => {
        room.participants.forEach(id => {
          if (id !== currentUserId) {
            participantIds.add(id);
          }
        });
      });

      participantIds.forEach(async (userId) => {
        const userInfo = await chatService.getUserInfo(userId);
        if (userInfo) {
          setUsers(prev => new Map(prev).set(userId, userInfo));
        }
      });
    });

    return unsubscribe;
  }, [currentUserId]);

  const getOtherParticipant = (room: ChatRoom): ChatUser | null => {
    const otherId = room.participants.find(id => id !== currentUserId);
    return otherId ? users.get(otherId) || null : null;
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}일 전`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) {
      return `${hours}시간 전`;
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) {
      return `${minutes}분 전`;
    }
    
    return '방금 전';
  };

  return (
    <Paper elevation={1} sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h2">
          채팅방 목록
        </Typography>
      </Box>
      <List sx={{ p: 0 }}>
        {rooms.map((room, index) => {
          const otherUser = getOtherParticipant(room);
          const isSelected = selectedRoomId === room.id;
          
          return (
            <React.Fragment key={room.id}>
              <ListItem
                button
                selected={isSelected}
                onClick={() => onRoomSelect(room)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={otherUser?.avatar}>
                    {otherUser?.name?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" component="span">
                      {otherUser?.name || '알 수 없는 사용자'}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      {room.lastMessage && (
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {room.lastMessage.content}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(room.updatedAt)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < rooms.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
        {rooms.length === 0 && (
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary" align="center">
                  채팅방이 없습니다
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default ChatRoomList;

