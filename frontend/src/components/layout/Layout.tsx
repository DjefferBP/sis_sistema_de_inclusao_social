import React from 'react';
import { Container } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <Container component="main" sx={{ py: 3 }}>
        {children}
      </Container>
    </>
  );
};

export default Layout;