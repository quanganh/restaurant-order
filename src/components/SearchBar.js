import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Fade,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Restaurant as RestaurantIcon,
} from '@mui/icons-material';

const SearchBar = ({ 
  searchTerm, 
  onSearchChange, 
  suggestions = [], 
  onSuggestionClick,
  placeholder = "Search menu items...",
  showSuggestions = true 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [focused, setFocused] = useState(false);
  
  const showSuggestionsList = showSuggestions && focused && searchTerm.length > 0 && suggestions.length > 0;

  const handleInputFocus = (event) => {
    setFocused(true);
    setAnchorEl(event.currentTarget);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => {
      setFocused(false);
      setAnchorEl(null);
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick(suggestion);
    setFocused(false);
    setAnchorEl(null);
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setFocused(false);
    setAnchorEl(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <Box component="span" key={index} sx={{ backgroundColor: '#fff59d', fontWeight: 600 }}>
          {part}
        </Box> : part
    );
  };

  return (
    <ClickAwayListener onClickAway={() => setFocused(false)}>
      <Box sx={{ position: 'relative', mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  edge="end"
                  size="small"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: 'background.paper',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
                borderWidth: 2,
              },
            },
          }}
        />

        <Popper
          open={showSuggestionsList}
          anchorEl={anchorEl}
          placement="bottom-start"
          style={{ width: anchorEl ? anchorEl.clientWidth : 'auto', zIndex: 1300 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <Paper
                elevation={8}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  overflow: 'hidden',
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ px: 2, py: 1, display: 'block' }}
                  >
                    {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} found
                  </Typography>
                </Box>
                
                <List dense sx={{ p: 0 }}>
                  {suggestions.map((item, index) => (
                    <ListItem
                      key={item._id}
                      button
                      onClick={() => handleSuggestionClick(item)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        borderBottom: index < suggestions.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={item.image}
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: 'primary.light',
                          }}
                        >
                          <RestaurantIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {highlightText(item.name, searchTerm)}
                            </Typography>
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                              {formatPrice(item.price)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {highlightText(item.description, searchTerm)}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="primary"
                              sx={{ 
                                textTransform: 'capitalize',
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                mt: 0.5,
                                display: 'inline-block',
                              }}
                            >
                              {item.category.replace('-', ' ')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {suggestions.length === 0 && searchTerm.length > 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <RestaurantIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No items found for "{searchTerm}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Try searching with different keywords
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Fade>
          )}
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBar;
