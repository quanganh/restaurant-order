import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  AppBar,
  Toolbar,
  Badge,
  Fab,
  Skeleton,
  Alert,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon,
  CallSplit as ServiceIcon,
} from '@mui/icons-material';

import MenuItemCard from '../components/MenuItemCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';

const Menu = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { getItemCount } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tableInfo, setTableInfo] = useState(null);

  // Fetch menu data
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [menuResponse, categoriesResponse, tableResponse] = await Promise.all([
          api.get('/api/menu'),
          api.get('/api/menu/categories/list'),
          api.get(`/api/tables/${tableNumber}`)
        ]);

        // Validate response data
        if (menuResponse.data && Array.isArray(menuResponse.data)) {
          setMenuItems(menuResponse.data);
        } else {
          console.warn('Invalid menu data received:', menuResponse.data);
          setMenuItems([]);
        }

        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else {
          console.warn('Invalid categories data received:', categoriesResponse.data);
          setCategories([]);
        }

        if (tableResponse.data) {
          setTableInfo(tableResponse.data);
        } else {
          console.warn('Invalid table data received:', tableResponse.data);
          setTableInfo(null);
        }

      } catch (err) {
        console.error('Error fetching menu data:', err);
        const errorMessage = err.response?.data?.message ||
                           err.message ||
                           'Failed to load menu. Please try again.';
        setError(errorMessage);

        // Set empty arrays as fallback
        setMenuItems([]);
        setCategories([]);
        setTableInfo(null);
      } finally {
        setLoading(false);
      }
    };

    if (tableNumber) {
      fetchMenuData();
    } else {
      setError('Invalid table number');
      setLoading(false);
    }
  }, [tableNumber]);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.ingredients?.some(ingredient =>
          ingredient.toLowerCase().includes(search)
        ) ||
        item.category.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [menuItems, activeCategory, searchTerm]);

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (searchTerm.length < 2) return [];

    const search = searchTerm.toLowerCase();
    return menuItems
      .filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
      )
      .slice(0, 5);
  }, [menuItems, searchTerm]);

  // Item counts by category
  const itemCounts = useMemo(() => {
    const counts = { all: menuItems.length };
    categories.forEach(category => {
      counts[category] = menuItems.filter(item => item.category === category).length;
    });
    return counts;
  }, [menuItems, categories]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSearchTerm(''); // Clear search when changing category
  };

  const handleSearchSuggestionClick = (item) => {
    // Scroll to item or highlight it
    setSearchTerm('');
    setActiveCategory(item.category);
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

  const cartItemCount = getItemCount();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={150} height={24} />
        </Box>

        {/* Search Skeleton */}
        <Skeleton variant="rectangular" height={56} sx={{ mb: 3, borderRadius: 12 }} />

        {/* Categories Skeleton */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} variant="rectangular" width={120} height={40} sx={{ borderRadius: 20 }} />
          ))}
        </Box>

        {/* Menu Items Skeleton */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid xs={12} sm={6} md={4} key={i}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="text" width="80%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={32} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mr: 2 }}
        >
          Retry
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/table/${tableNumber}`)}
        >
          Back to Table
        </Button>
      </Container>
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
            onClick={() => navigate(`/table/${tableNumber}`)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              Menu - Table {tableNumber}
            </Typography>
            {tableInfo && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {tableInfo.name || `Table ${tableNumber}`}
              </Typography>
            )}
          </Box>

          <Button
            startIcon={<ServiceIcon />}
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
            Our Menu
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Browse our delicious selection and add items to your cart
          </Typography>
        </Box>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          suggestions={searchSuggestions}
          onSuggestionClick={handleSearchSuggestionClick}
        />

        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          showCounts={true}
          itemCounts={itemCounts}
        />

        {/* Results Info */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
            {activeCategory !== 'all' && ` in ${activeCategory.replace('-', ' ')}`}
          </Typography>

          {(searchTerm || activeCategory !== 'all') && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Menu Items Grid */}
        {filteredItems.length > 0 ? (
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid xs={12} sm={6} md={4} key={item._id}>
                <MenuItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              No items found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm
                ? `No menu items match "${searchTerm}"`
                : `No items available in ${activeCategory.replace('-', ' ')}`}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              View All Items
            </Button>
          </Paper>
        )}
      </Container>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={() => navigate(`/cart/${tableNumber}`)}
        >
          <Badge badgeContent={cartItemCount} color="error">
            <CartIcon />
          </Badge>
        </Fab>
      )}
    </>
  );
};

export default Menu;
