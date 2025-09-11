import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  LocalFireDepartment as SpicyIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Restaurant as RestaurantIcon,
  LocalDining as DiningIcon,
  Done as DoneIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ordersAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';

const OrderStatus = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders for the table
  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const response = await ordersAPI.getByTable(tableNumber);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load order information. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [tableNumber]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (socket) {
      // Join table room for real-time updates
      socket.emit('join-table', tableNumber);

      // Listen for order status updates
      const handleOrderStatusUpdate = (data) => {
        console.log('Order status update received:', data);
        // Refresh orders when status updates
        fetchOrders();
      };

      const handleOrderCancelled = (data) => {
        console.log('Order cancelled:', data);
        // Refresh orders when order is cancelled
        fetchOrders();
      };

      socket.on('order-status-updated', handleOrderStatusUpdate);
      socket.on('order-cancelled', handleOrderCancelled);

      return () => {
        socket.off('order-status-updated', handleOrderStatusUpdate);
        socket.off('order-cancelled', handleOrderCancelled);
      };
    }
  }, [socket, tableNumber]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSpicyIcons = (level) => {
    const icons = [];
    for (let i = 0; i < level; i++) {
      icons.push(<SpicyIcon key={i} sx={{ color: '#E74C3C', fontSize: 16 }} />);
    }
    return icons;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'preparing': return 'primary';
      case 'ready': return 'success';
      case 'served': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ScheduleIcon />;
      case 'confirmed': return <CheckIcon />;
      case 'preparing': return <RestaurantIcon />;
      case 'ready': return <DiningIcon />;
      case 'served': return <DoneIcon />;
      case 'completed': return <DoneIcon />;
      case 'cancelled': return <CheckIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'pending': return 10;
      case 'confirmed': return 25;
      case 'preparing': return 50;
      case 'ready': return 75;
      case 'served': return 90;
      case 'completed': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const getEstimatedTime = (order) => {
    if (order.status === 'completed' || order.status === 'cancelled') {
      return null;
    }

    if (order.estimatedReadyTime) {
      const now = new Date();
      const readyTime = new Date(order.estimatedReadyTime);
      const diffMinutes = Math.ceil((readyTime - now) / (1000 * 60));

      if (diffMinutes > 0) {
        return `${diffMinutes} minutes`;
      } else {
        return 'Ready soon!';
      }
    }

    return 'Calculating...';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading order information...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchOrders}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <>
        <AppBar position="sticky" elevation={2}>
          <Toolbar>
            <Button
              startIcon={<BackIcon />}
              color="inherit"
              onClick={() => navigate(`/menu/${tableNumber}`)}
              sx={{ mr: 2 }}
            >
              Back to Menu
            </Button>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div">
                Order Status - Table {tableNumber}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
            <RestaurantIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No orders found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You haven't placed any orders yet. Browse our menu to get started!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/menu/${tableNumber}`)}
              startIcon={<RestaurantIcon />}
            >
              Browse Menu
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          <Button
            startIcon={<BackIcon />}
            color="inherit"
            onClick={() => navigate(`/menu/${tableNumber}`)}
            sx={{ mr: 2 }}
          >
            Back to Menu
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Order Status - Table {tableNumber}
            </Typography>
          </Box>
          <Tooltip title="Refresh">
            <IconButton
              color="inherit"
              onClick={fetchOrders}
              disabled={refreshing}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {orders.map((order, index) => (
          <Card key={order._id} sx={{ mb: 3, overflow: 'visible' }}>
            <CardContent>
              {/* Order Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Order #{order.orderNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Placed at {formatTime(order.createdAt)}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(order.status)}
                  label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  color={getStatusColor(order.status)}
                  variant="filled"
                />
              </Box>

              {/* Progress Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Order Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getStatusProgress(order.status)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getStatusProgress(order.status)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {/* Estimated Time */}
              {getEstimatedTime(order) && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TimeIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {order.status === 'ready' || order.status === 'served'
                        ? 'Your order is ready!'
                        : `Estimated ready time: ${getEstimatedTime(order)}`
                      }
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* Order Items */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Items
              </Typography>
              <List>
                {order.items.map((item, itemIndex) => (
                  <React.Fragment key={item._id}>
                    <ListItem sx={{ py: 2 }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 60, height: 60, borderRadius: 1, mr: 2 }}
                        image={item.menuItem.image || '/api/placeholder/60/60'}
                        alt={item.menuItem.name}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.menuItem.name}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                            {formatPrice(item.menuItem.price * item.quantity)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Qty: ${item.quantity}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={item.menuItem.category.replace('-', ' ')}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                          {item.menuItem.spicyLevel > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {getSpicyIcons(item.menuItem.spicyLevel)}
                            </Box>
                          )}
                          {item.preparationTime && (
                            <Chip
                              icon={<TimeIcon />}
                              label={`${item.preparationTime} min`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {item.specialInstructions && (
                          <Typography
                            variant="body2"
                            sx={{
                              fontStyle: 'italic',
                              color: 'primary.main',
                              backgroundColor: 'primary.light',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            Note: {item.specialInstructions}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                    {itemIndex < order.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              {/* Order Summary */}
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {order.customerNotes && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Special Instructions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.customerNotes}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">{formatPrice(order.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tax:</Typography>
                      <Typography variant="body2">{formatPrice(order.tax)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                        {formatPrice(order.total)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Container>
    </>
  );
};

export default OrderStatus;
