import React from 'react';
import {
  Box,
  Chip,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Restaurant,
  LocalDining as MainCourseIcon,
  Cake as DessertIcon,
  LocalCafe as BeverageIcon,
  Star as SpecialIcon,
} from '@mui/icons-material';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange, showCounts = false, itemCounts = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const categoryConfig = {
    all: {
      label: 'All Items',
      icon: <Restaurant />,
      color: theme.palette.primary.main,
    },
    appetizers: {
      label: 'Appetizers',
      icon: <Restaurant />,
      color: '#FF6B35',
    },
    'main-courses': {
      label: 'Main Courses',
      icon: <MainCourseIcon />,
      color: '#2C3E50',
    },
    desserts: {
      label: 'Desserts',
      icon: <DessertIcon />,
      color: '#E74C3C',
    },
    beverages: {
      label: 'Beverages',
      icon: <BeverageIcon />,
      color: '#3498DB',
    },
    specials: {
      label: 'Specials',
      icon: <SpecialIcon />,
      color: '#F39C12',
    },
  };

  const DefaultIcon = () => <Restaurant />;

  const allCategories = ['all', ...categories];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Categories
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          pb: isMobile ? 1 : 0,
          '&::-webkit-scrollbar': {
            height: 4,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 2,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.main,
            borderRadius: 2,
          },
        }}
      >
        {allCategories.map((category) => {
          const config = categoryConfig[category];
          const isActive = activeCategory === category;
          const count = itemCounts[category] || 0;

          if (!config) {
            // Fallback for unknown categories
            return (
              <Chip
                key={category}
                label={category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                variant={isActive ? 'filled' : 'outlined'}
                onClick={() => onCategoryChange(category)}
                sx={{
                  minWidth: isMobile ? 'auto' : 120,
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                  color: isActive ? 'white' : theme.palette.text.primary,
                  borderColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: isActive 
                      ? theme.palette.primary.dark 
                      : theme.palette.primary.light + '20',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              />
            );
          }

          return (
            <Chip
              key={category}
              icon={config.icon}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{config.label}</span>
                  {showCounts && count > 0 && (
                    <Box
                      component="span"
                      sx={{
                        backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : config.color + '20',
                        color: isActive ? 'white' : config.color,
                        borderRadius: '50%',
                        minWidth: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        ml: 0.5,
                      }}
                    >
                      {count}
                    </Box>
                  )}
                </Box>
              }
              variant={isActive ? 'filled' : 'outlined'}
              onClick={() => onCategoryChange(category)}
              sx={{
                minWidth: isMobile ? 'auto' : 120,
                height: 40,
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? config.color : 'transparent',
                color: isActive ? 'white' : theme.palette.text.primary,
                borderColor: config.color,
                '& .MuiChip-icon': {
                  color: isActive ? 'white' : config.color,
                },
                '&:hover': {
                  backgroundColor: isActive 
                    ? config.color 
                    : config.color + '20',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${config.color}40`,
                },
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default CategoryFilter;
