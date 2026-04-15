


import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  Article as ArticleIcon,
  Template as TemplateIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

import Dashboard from './pages/Dashboard';
import InquiriesPage from './pages/InquiriesPage';
import SentimentMonitoring from './pages/SentimentMonitoring';
import NewsMonitoring from './pages/NewsMonitoring';
import ResponseTemplates from './pages/ResponseTemplates';

const drawerWidth = 280;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  component: React.ComponentType;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, component: Dashboard },
  { text: 'Inquiries', icon: <EmailIcon />, component: InquiriesPage, badge: 12 },
  { text: 'Sentiment Monitoring', icon: <TrendingUpIcon />, component: SentimentMonitoring },
  { text: 'News Monitoring', icon: <ArticleIcon />, component: NewsMonitoring, badge: 3 },
  { text: 'Response Templates', icon: <TemplateIcon />, component: ResponseTemplates },
];

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (index: number) => {
    setSelectedIndex(index);
    setMobileOpen(false);
  };

  const CurrentComponent = menuItems[selectedIndex].component;

  const drawer = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ fontSize: '2rem' }}>🏛️</Box>
          <Box>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: '#1976d2' }}>
              Fed Comms AI
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Communication Management
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={selectedIndex === index}
              onClick={() => handleMenuClick(index)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon>
              <Badge badgeContent={5} color="error">
                <WarningIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Risk Alerts" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems[selectedIndex].text}
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={8} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <CurrentComponent />
        </Container>
      </Box>
    </Box>
  );
};

export default App;


