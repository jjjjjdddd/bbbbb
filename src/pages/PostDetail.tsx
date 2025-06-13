import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';

interface Post {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  createdAt: string;
  userId: string;
}

interface User {
  id: string;
  username: string;
}

const PostDetail: React.FC = () => {
  const { userId, postId } = useParams<{ userId: string; postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 게시글 정보 가져오기
  const fetchPost = async () => {
    if (!userId || !postId) return;

    try {
      const postRef = doc(db, 'posts', userId, 'userPosts', postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        setError('게시글을 찾을 수 없습니다.');
        return;
      }

      setPost({ id: postSnap.id, ...postSnap.data() } as Post);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('게시글을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 사용자 정보 가져오기
  const fetchUser = async () => {
    if (!userId) return;

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUser({ id: userSnap.id, ...userSnap.data() } as User);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  // 이미지 URL 가져오기
  const fetchImages = async () => {
    if (!userId || !postId) return;

    try {
      const storageRef = ref(storage, `posts/${userId}/${postId}`);
      const result = await listAll(storageRef);
      
      const imageUrls = await Promise.all(
        result.items.map(async (item) => {
          return await getDownloadURL(item);
        })
      );

      setImages(imageUrls);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  };

  // 찜하기 상태 확인
  const checkFavoriteStatus = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !postId) return;

    try {
      const favoriteRef = doc(db, 'users', currentUser.uid, 'likes', postId);
      const favoriteSnap = await getDoc(favoriteRef);
      setIsFavorite(favoriteSnap.exists());
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setSnackbar({
        open: true,
        message: '찜하기 상태를 확인하는 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  // 찜하기 토글
  const toggleFavorite = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: '로그인이 필요한 기능입니다.',
        severity: 'error',
      });
      return;
    }

    if (!postId || !post) return;

    try {
      const favoriteRef = doc(db, 'users', currentUser.uid, 'likes', postId);

      if (isFavorite) {
        // 찜하기 취소
        await deleteDoc(favoriteRef);
        setIsFavorite(false);
        setSnackbar({
          open: true,
          message: '찜하기가 취소되었습니다.',
          severity: 'success',
        });
      } else {
        // 찜하기 추가
        await setDoc(favoriteRef, {
          postId,
          postTitle: post.title,
          postPrice: post.price,
          postCategory: post.category,
          postImage: images[0] || null,
          createdAt: new Date().toISOString(),
          sellerId: userId,
        });
        setIsFavorite(true);
        setSnackbar({
          open: true,
          message: '찜하기가 추가되었습니다.',
          severity: 'success',
        });
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setSnackbar({
        open: true,
        message: '찜하기 처리 중 오류가 발생했습니다.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPost(),
        fetchUser(),
        fetchImages(),
        checkFavoriteStatus(),
      ]);
      setLoading(false);
    };

    loadData();
  }, [userId, postId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !post) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error || '게시글을 찾을 수 없습니다.'}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* 이미지 갤러리 */}
          <Grid item xs={12} md={6}>
            <ImageList cols={1} rowHeight={400}>
              {images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image}
                    alt={`${post.title} - 이미지 ${index + 1}`}
                    loading="lazy"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Grid>

          {/* 게시글 정보 */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {post.title}
              </Typography>
              <Chip label={post.category} color="primary" sx={{ mb: 2 }} />
              <Typography variant="h5" color="primary" gutterBottom>
                {Number(post.price).toLocaleString()}원
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                판매자 정보
              </Typography>
              <Typography variant="body1">
                {user?.username || '알 수 없음'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                상품 설명
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {post.description}
              </Typography>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => navigate(`/chat/${userId}`)}
              >
                채팅하기
              </Button>
              <IconButton
                color="primary"
                onClick={toggleFavorite}
                sx={{ p: 2 }}
              >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PostDetail; 