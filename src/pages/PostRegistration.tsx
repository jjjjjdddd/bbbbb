import React from 'react';
import { Container, Typography } from '@mui/material';

const PostRegistration: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        게시물 등록
      </Typography>
    </Container>
  );
};

export default PostRegistration; 