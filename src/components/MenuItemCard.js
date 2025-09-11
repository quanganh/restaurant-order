import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Divider,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  LocalFireDepartment as SpicyIcon,
  AccessTime as TimeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const MenuItemCard = ({ item, showAddButton = true, compact = false }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  const currentQuantity = getItemQuantity(item._id);

  const handleAddToCart = () => {
    addToCart(item);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 0) {
      if (newQuantity === 0) {
        // Remove item from cart
        updateQuantity(item._id, 0);
      } else {
        // Update quantity directly
        updateQuantity(item._id, newQuantity);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getCategoryColor = (category) => {
    const colors = {
      appetizers: '#FF6B35',
      'main-courses': '#2C3E50',
      desserts: '#E74C3C',
      beverages: '#3498DB',
      specials: '#F39C12',
    };
    return colors[category] || '#95A5A6';
  };

  const getSpicyIcons = (level) => {
    const icons = [];
    for (let i = 0; i < level; i++) {
      icons.push(<SpicyIcon key={i} sx={{ color: '#E74C3C', fontSize: 16 }} />);
    }
    return icons;
  };

  return (
    <>
      <Card
        sx={{
          height: compact ? 'auto' : '100%',
          display: 'flex',
          flexDirection: compact ? 'row' : 'column',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }
        }}
      >
        {item.image && !imageError ? (
          <Box sx={{ position: 'relative' }}>
            {imageLoading && (
              <Skeleton
                variant="rectangular"
                height={compact ? 100 : 200}
                width={compact ? 100 : '100%'}
                sx={{ position: 'absolute', top: 0, left: 0 }}
              />
            )}
            <CardMedia
              component="img"
              height={compact ? "100" : "200"}
              width={compact ? "100" : "100%"}
              image={item.image}
              alt={item.name}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              sx={{
                objectFit: 'cover',
                width: compact ? 100 : '100%',
                flexShrink: 0,
                opacity: imageLoading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: compact ? 100 : 200,
              width: compact ? 100 : '100%',
              backgroundColor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No Image
            </Typography>
          </Box>
        )}

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography
              variant={compact ? "subtitle1" : "h6"}
              component="h3"
              sx={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              {item.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setDetailsOpen(true)}
              sx={{ ml: 1 }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label={item.category.replace('-', ' ')}
              size="small"
              sx={{
                backgroundColor: getCategoryColor(item.category),
                color: 'white',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            />
            {item.spicyLevel > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getSpicyIcons(item.spicyLevel)}
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

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.description}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h6"
              color="primary"
              sx={{ fontWeight: 700 }}
            >
              {formatPrice(item.price)}
            </Typography>

            {showAddButton && item.available && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {currentQuantity > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(currentQuantity - 1)}
                      color="primary"
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography variant="body1" sx={{ minWidth: 20, textAlign: 'center' }}>
                      {currentQuantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(currentQuantity + 1)}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddToCart}
                    sx={{ borderRadius: 20 }}
                  >
                    Add
                  </Button>
                )}
              </Box>
            )}

            {!item.available && (
              <Chip
                label="Unavailable"
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {item.name}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
            {formatPrice(item.price)}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {item.image && !imageError ? (
            <Box sx={{ mb: 2 }}>
              <img
                src={item.image}
                alt={item.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
                onError={() => setImageError(true)}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '200px',
                backgroundColor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                mb: 2
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No Image Available
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={item.category.replace('-', ' ')}
              sx={{
                backgroundColor: getCategoryColor(item.category),
                color: 'white',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}
            />
            {item.spicyLevel > 0 && (
              <Chip
                icon={<Box sx={{ display: 'flex' }}>{getSpicyIcons(item.spicyLevel)}</Box>}
                label={`Spicy Level ${item.spicyLevel}`}
                color="error"
                variant="outlined"
              />
            )}
            <Chip
              icon={<TimeIcon />}
              label={`${item.preparationTime} minutes`}
              variant="outlined"
            />
          </Box>

          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            {item.description}
          </Typography>

          {item.ingredients && item.ingredients.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Ingredients
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.ingredients.join(', ')}
              </Typography>
            </>
          )}

          {item.allergens && item.allergens.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
                Allergens
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {item.allergens.map((allergen, index) => (
                  <Chip
                    key={index}
                    label={allergen}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          {showAddButton && item.available && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                handleAddToCart();
                setDetailsOpen(false);
              }}
            >
              Add to Cart
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MenuItemCard;
