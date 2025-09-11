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
  IconButton,
  TextField,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  LocalFireDepartment as SpicyIcon,
  AccessTime as TimeIcon,
  Edit as EditIcon,
  Payment as CheckoutIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

const Cart = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const {
    items,
    customerNotes,
    setCustomerNotes,
    removeItem,
    updateQuantity,
    updateSpecialInstructions,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    setTableNumber
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Set table number when component mounts
  useEffect(() => {
    if (tableNumber) {
      setTableNumber(tableNumber);
    }
  }, [tableNumber]); // Remove setTableNumber from dependencies to prevent infinite loop

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getSpicyIcons = (level) => {
    const icons = [];
    for (let i = 0; i < level; i++) {
      icons.push(<SpicyIcon key={i} sx={{ color: '#E74C3C', fontSize: 16 }} />);
    }
    return icons;
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(item.menuItem._id);
    } else {
      updateQuantity(item.menuItem._id, newQuantity);
    }
  };

  const handleEditInstructions = (item) => {
    setEditingItem(item);
    setSpecialInstructions(item.specialInstructions || '');
    setInstructionsOpen(true);
  };

  const handleSaveInstructions = () => {
    if (editingItem) {
      updateSpecialInstructions(editingItem.menuItem._id, specialInstructions);
    }
    setInstructionsOpen(false);
    setEditingItem(null);
    setSpecialInstructions('');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty. Add some items before checking out.');
      return;
    }

    if (!tableNumber || isNaN(parseInt(tableNumber))) {
      setError('Invalid table number. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Validate cart items before sending
      const validItems = items.filter(item =>
        item.menuItem &&
        item.menuItem._id &&
        item.quantity > 0 &&
        typeof item.menuItem.price === 'number'
      );

      if (validItems.length === 0) {
        setError('No valid items in cart. Please refresh and try again.');
        return;
      }

      const orderData = {
        tableNumber: parseInt(tableNumber),
        items: validItems.map(item => ({
          menuItem: item.menuItem._id,
          quantity: parseInt(item.quantity),
          specialInstructions: item.specialInstructions || ''
        })),
        customerNotes: customerNotes || '',
        subtotal: getSubtotal(),
        tax: getTax(),
        total: getTotal()
      };

      const response = await api.post('/api/orders', orderData);

      // Clear cart after successful order
      clearCart();

      setSuccess(true);

      // Navigate to order status page after a short delay
      setTimeout(() => {
        navigate(`/order-status/${tableNumber}`);
      }, 2000);

    } catch (err) {
      console.error('Error creating order:', err);
      const errorMessage = err.response?.data?.message ||
                         err.message ||
                         'Failed to place order. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCallService = async () => {
    try {
      await api.post(`/api/tables/${tableNumber}/service`, {
        message: 'Customer is requesting service'
      });
      // Show success notification - could be enhanced with a toast notification
      console.log('Service call sent successfully');
    } catch (err) {
      console.error('Error calling service:', err);
      const errorMessage = err.response?.data?.message ||
                         err.message ||
                         'Failed to call service. Please try again.';
      setError(errorMessage);
    }
  };

  if (items.length === 0) {
    return (
      <>
        {/* Top App Bar */}
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
                Cart - Table {tableNumber}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
            <CartIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Browse our menu and add some delicious items to get started
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/menu/${tableNumber}`)}
              startIcon={<CartIcon />}
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
      {/* Top App Bar */}
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
              Cart - Table {tableNumber}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {items.length} item{items.length !== 1 ? 's' : ''} in cart
            </Typography>
          </Box>

          <Button
            color="inherit"
            onClick={handleCallService}
            sx={{ mr: 1 }}
          >
            Call Service
          </Button>
        </Toolbar>
      </AppBar>

    <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Your Order
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Review your items and proceed to checkout
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid xs={12} md={8}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Cart Items ({items.length})
            </Typography>

            <List sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
              {items.map((item, index) => (
                <React.Fragment key={item.menuItem._id}>
                  <ListItem sx={{ py: 2 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, borderRadius: 1, mr: 2 }}
                      image={item.menuItem.image}
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
                          label={item.menuItem.category.replace('-', ' ')}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {item.menuItem.spicyLevel > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getSpicyIcons(item.menuItem.spicyLevel)}
                          </Box>
                        )}
                        {item.menuItem.preparationTime && (
                          <Chip
                            icon={<TimeIcon />}
                            label={`${item.menuItem.preparationTime} min`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {item.menuItem.description}
                      </Typography>

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

                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            color="primary"
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography variant="body1" sx={{ minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            color="primary"
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditInstructions(item)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => removeItem(item.menuItem._id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>

                  {index < items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Grid>

          {/* Order Summary */}
          <Grid xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 100 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Order Summary
                </Typography>

                {/* Customer Notes */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Special Instructions
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Any special requests for your order?"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Price Breakdown */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">{formatPrice(getSubtotal())}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tax (10%):</Typography>
                    <Typography variant="body2">{formatPrice(getTax())}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Total:</Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      {formatPrice(getTotal())}
      </Typography>
                  </Box>
                </Box>

                {/* Checkout Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckoutIcon />}
                  onClick={handleCheckout}
                  disabled={loading}
                  sx={{ mb: 2 }}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(`/menu/${tableNumber}`)}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Container>

      {/* Special Instructions Dialog */}
      <Dialog
        open={instructionsOpen}
        onClose={() => setInstructionsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Special Instructions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {editingItem?.menuItem.name}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Add any special instructions for this item..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setInstructionsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveInstructions}
          >
            Save Instructions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Order placed successfully! Redirecting to order status...
        </Alert>
      </Snackbar>
    </>
  );
};

export default Cart;
