import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Skeleton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Restaurant as MenuIcon,
  ShoppingCart as OrderIcon,
  TableRestaurant as TableIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationIcon,
  ExitToApp as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Room as ServiceIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

import { adminAPI } from '../../services/api';
import { useSocket } from '../../contexts/SocketContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { socket, isConnected, isInitialized, connectionError, joinAdmin, safeOn, safeOff } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Memoize the event handlers to prevent unnecessary re-renders
  const handleNewOrder = useCallback((orderData) => {
    setNotifications(prev => [{
      id: Date.now(),
      type: 'order',
      message: `New order #${orderData.orderNumber} from Table ${orderData.tableNumber}`,
      timestamp: new Date(),
      read: false
    }, ...prev.slice(0, 9)]);

    // Update dashboard data
    fetchDashboardData();
  }, []);

  const handleServiceCall = useCallback((serviceData) => {
    setNotifications(prev => [{
      id: Date.now(),
      type: 'service',
      message: `Service request from Table ${serviceData.tableNumber}`,
      timestamp: new Date(),
      read: false
    }, ...prev.slice(0, 9)]);

    // Update dashboard data
    fetchDashboardData();
  }, []);

  const handleOrderUpdate = useCallback((updateData) => {
    // Update dashboard data for status changes
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      if (err.response?.status === 401) {
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    console.log('AdminDashboard: Setting up socket listeners', { isInitialized, socket: !!socket, isConnected });

    // Only set up socket listeners when socket is initialized and connected
    if (isInitialized && socket && isConnected) {
      console.log('AdminDashboard: Socket ready, setting up listeners');

      // Join admin room for real-time updates
      joinAdmin();

      // Listen for real-time updates using safe helper functions
      safeOn('new-order', handleNewOrder);
      safeOn('service-called', handleServiceCall);
      safeOn('order-status-updated', handleOrderUpdate);

      return () => {
        console.log('AdminDashboard: Cleaning up socket listeners');
        safeOff('new-order', handleNewOrder);
        safeOff('service-called', handleServiceCall);
        safeOff('order-status-updated', handleOrderUpdate);
      };
    } else {
      console.log('AdminDashboard: Socket not ready yet', { isInitialized, socket: !!socket, isConnected });
    }
  }, [isInitialized, socket, isConnected, joinAdmin, safeOn, safeOff, handleNewOrder, handleServiceCall, handleOrderUpdate]);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'primary',
      ready: 'success',
      completed: 'default',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🔔';
      case 'completed': return '✨';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <>
        <AppBar position="sticky">
          <Toolbar>
            <Skeleton variant="text" width={200} height={32} />
            <Box sx={{ flexGrow: 1 }} />
            <Skeleton variant="circular" width={40} height={40} />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={36} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchDashboardData}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <>
      {/* Top Navigation */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Restaurant Admin Dashboard
          </Typography>

          {/* Socket Connection Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
              variant="outlined"
            />
          </Box>

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>

          <IconButton
            color="inherit"
            onClick={handleMenuClick}
          >
            <Avatar sx={{ bgcolor: 'primary.dark' }}>
              <PersonIcon />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/admin/menu')}>
              <MenuIcon sx={{ mr: 2 }} /> Menu Management
            </MenuItem>
            <MenuItem onClick={() => navigate('/admin/orders')}>
              <OrderIcon sx={{ mr: 2 }} /> Orders
            </MenuItem>
            <MenuItem onClick={() => navigate('/admin/tables')}>
              <TableIcon sx={{ mr: 2 }} /> Tables
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Socket Connection Error Alert */}
      {connectionError && (
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Socket connection issue: {connectionError}. Real-time updates may not work properly.
          </Alert>
        </Container>
      )}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Quick Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardData.todayOrders}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Today's Orders
                    </Typography>
                  </Box>
                  <OrderIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div">
                      {formatPrice(dashboardData.todayRevenue)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Today's Revenue
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardData.activeOrders}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Active Orders
                    </Typography>
                  </Box>
                  <TimeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'info.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardData.tableStats.occupied}/{dashboardData.tableStats.total}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Tables Occupied
                    </Typography>
                  </Box>
                  <TableIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Orders */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    Recent Orders
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/admin/orders')}
                  >
                    View All
                  </Button>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order #</TableCell>
                        <TableCell>Table</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dashboardData.recentOrders.slice(0, 8).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>
                            #{order.orderNumber}
                          </TableCell>
                          <TableCell>
                            Table {order.tableNumber}
                          </TableCell>
                          <TableCell>
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </TableCell>
                          <TableCell>
                            {formatPrice(order.total)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={getOrderStatusColor(order.status)}
                              size="small"
                              icon={<span>{getOrderStatusIcon(order.status)}</span>}
                            />
                          </TableCell>
                          <TableCell>
                            {formatTime(order.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Service Calls & Top Items */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Service Calls */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Service Requests
                    </Typography>

                    {dashboardData.pendingServiceCalls.length > 0 ? (
                      <List dense>
                        {dashboardData.pendingServiceCalls.slice(0, 4).map((table) => (
                          table.serviceCalls
                            .filter(call => !call.resolved)
                            .slice(0, 2)
                            .map((call) => (
                              <ListItem key={call._id}>
                                <ListItemIcon>
                                  <ServiceIcon color="warning" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`Table ${table.number}`}
                                  secondary={call.message}
                                />
                                <ListItemSecondaryAction>
                                  <IconButton size="small" color="success">
                                    <CheckIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No pending service requests
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Menu Items */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Top Menu Items
                    </Typography>

                    <List dense>
                      {dashboardData.topMenuItems.slice(0, 5).map((item, index) => (
                        <ListItem key={item._id?._id}>
                          <ListItemIcon>
                            <Chip
                              label={index + 1}
                              color="primary"
                              size="small"
                              sx={{ width: 24, height: 24 }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={item._id?.name || 'Unknown Item'}
                            secondary={`${item.totalOrdered} orders • ${formatPrice(item.totalRevenue)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Quick Action Cards */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/menu')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <MenuIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" component="h3">
                  Menu Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add, edit, and manage menu items
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <OrderIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" component="h3">
                  Order Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track and update order status
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tables')}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <TableIcon sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" component="h3">
                  Table Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage tables and QR codes
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ cursor: 'pointer' }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <AnalyticsIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" component="h3">
                  Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View sales reports and metrics
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AdminDashboard;
