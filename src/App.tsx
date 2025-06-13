import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Pages
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';
import PostDetail from './pages/PostDetail';
import PostRegistration from './pages/PostRegistration';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my" element={<MyPage />} />
        <Route path="/post/:userId/:postId" element={<PostDetail />} />
        <Route path="/post/registration" element={<PostRegistration />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App; 