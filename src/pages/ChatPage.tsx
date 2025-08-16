import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ChatRoomList from '../components/chat/ChatRoomList';
import ChatWindow from '../components/chat/ChatWindow';
import { ChatRoom, ChatUser } from '../types/chat';
import { chatService } from '../services/chatService';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState('user123'); // 임시 사용자 ID
  const [currentUserName, setCurrentUserName] = useState('현재 사용자'); // 임시 사용자 이름

  // 실제 구현에서는 인증된 사용자 정보를 가져와야 합니다
  useEffect(() => {
    // TODO: 인증된 사용자 정보 가져오기
    // const user = auth.currentUser;
    // if (user) {
    //   setCurrentUserId(user.uid);
    //   setCurrentUserName(user.displayName || '사용자');
    // }
  }, []);

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleNewChat = async (selectedUserId: string) => {
    try {
      const roomId = await chatService.createChatRoom([currentUserId, selectedUserId]);
      const newRoom: ChatRoom = {
        id: roomId,
        participants: [currentUserId, selectedUserId],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSelectedRoom(newRoom);
      setShowNewChatDialog(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // TODO: 실제 사용자 검색 구현
      // 임시로 더미 데이터 사용
      const dummyUsers: ChatUser[] = [
        {
          id: 'user1',
          name: '김철수',
          isOnline: true,
        },
        {
          id: 'user2',
          name: '이영희',
          isOnline: false,
        },
        {
          id: 'user3',
          name: '박민수',
          isOnline: true,
        },
      ];

      const filteredUsers = dummyUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            채팅
          </Typography>
        </Toolbar>
      </AppBar>

      {/* 메인 컨텐츠 */}
      <Box sx={{ flex: 1, display: 'flex' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* 채팅방 목록 */}
          <Grid item xs={12} md={4} sx={{ height: '100%', borderRight: 1, borderColor: 'divider' }}>
            <ChatRoomList
              currentUserId={currentUserId}
              onRoomSelect={handleRoomSelect}
              selectedRoomId={selectedRoom?.id}
            />
          </Grid>

          {/* 채팅 창 */}
          <Grid item xs={12} md={8} sx={{ height: '100%' }}>
            <ChatWindow
              room={selectedRoom}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />
          </Grid>
        </Grid>
      </Box>

      {/* 새 채팅 버튼 */}
      <Fab
        color="primary"
        aria-label="새 채팅"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setShowNewChatDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* 새 채팅 다이얼로그 */}
      <Dialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>새 채팅 시작</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              fullWidth
              placeholder="사용자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </Box>
          
          <List>
            {searchResults.map((user, index) => (
              <React.Fragment key={user.id}>
                <ListItem button onClick={() => handleNewChat(user.id)}>
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>
                      {user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.isOnline ? '온라인' : '오프라인'}
                  />
                </ListItem>
                {index < searchResults.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {searchResults.length === 0 && searchQuery && (
              <ListItem>
                <ListItemText
                  primary="검색 결과가 없습니다"
                  sx={{ textAlign: 'center' }}
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewChatDialog(false)}>취소</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatPage;

