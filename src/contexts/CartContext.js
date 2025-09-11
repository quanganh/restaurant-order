import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items || [],
        tableNumber: action.payload.tableNumber || null,
        customerNotes: action.payload.customerNotes || ''
      };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.menuItem._id === action.payload.menuItem._id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += action.payload.quantity;
        return {
          ...state,
          items: updatedItems
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload]
        };
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.menuItem._id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.menuItem._id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'UPDATE_SPECIAL_INSTRUCTIONS':
      return {
        ...state,
        items: state.items.map(item =>
          item.menuItem._id === action.payload.id
            ? { ...item, specialInstructions: action.payload.instructions }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'SET_TABLE_NUMBER':
      return {
        ...state,
        tableNumber: action.payload
      };

    case 'SET_CUSTOMER_NOTES':
      return {
        ...state,
        customerNotes: action.payload
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  tableNumber: null,
  customerNotes: ''
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        // Set the entire state at once to avoid multiple dispatches
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('restaurant-cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes (but not during initial load)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('restaurant-cart', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  const addItem = (menuItem, quantity = 1, specialInstructions = '') => {
    // Validate input
    if (!menuItem || !menuItem._id) {
      console.error('Invalid menu item provided to addItem');
      return;
    }

    if (quantity <= 0 || !Number.isInteger(quantity)) {
      console.error('Invalid quantity provided to addItem');
      return;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        menuItem,
        quantity,
        specialInstructions: specialInstructions || ''
      }
    });
  };

  const removeItem = (menuItemId) => {
    if (!menuItemId) {
      console.error('Invalid menu item ID provided to removeItem');
      return;
    }
    dispatch({ type: 'REMOVE_ITEM', payload: menuItemId });
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (!menuItemId) {
      console.error('Invalid menu item ID provided to updateQuantity');
      return;
    }

    if (quantity < 0 || !Number.isInteger(quantity)) {
      console.error('Invalid quantity provided to updateQuantity');
      return;
    }

    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: menuItemId, quantity }
    });
  };

  const updateSpecialInstructions = (menuItemId, instructions) => {
    if (!menuItemId) {
      console.error('Invalid menu item ID provided to updateSpecialInstructions');
      return;
    }

    dispatch({
      type: 'UPDATE_SPECIAL_INSTRUCTIONS',
      payload: { id: menuItemId, instructions: instructions || '' }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setTableNumber = (tableNumber) => {
    if (tableNumber && (Number.isInteger(tableNumber) || !isNaN(parseInt(tableNumber)))) {
      dispatch({ type: 'SET_TABLE_NUMBER', payload: parseInt(tableNumber) });
    } else {
      console.error('Invalid table number provided to setTableNumber');
    }
  };

  const setCustomerNotes = (notes) => {
    dispatch({ type: 'SET_CUSTOMER_NOTES', payload: notes || '' });
  };

  const getSubtotal = () => {
    return state.items.reduce((total, item) => {
      const price = parseFloat(item.menuItem.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const getTax = () => {
    const subtotal = getSubtotal();
    return Math.round(subtotal * 0.1 * 100) / 100; // 10% tax, rounded to 2 decimal places
  };

  const getTotal = () => {
    const subtotal = getSubtotal();
    const tax = getTax();
    return Math.round((subtotal + tax) * 100) / 100; // Rounded to 2 decimal places
  };

  const getItemCount = () => {
    return state.items.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      return total + quantity;
    }, 0);
  };

  const getItemQuantity = (menuItemId) => {
    if (!menuItemId) return 0;
    const item = state.items.find(item => item.menuItem._id === menuItemId);
    return item ? parseInt(item.quantity) || 0 : 0;
  };

  const addToCart = (menuItem, specialInstructions = '') => {
    addItem(menuItem, 1, specialInstructions);
  };

  const value = {
    ...state,
    addItem,
    addToCart,
    removeItem,
    updateQuantity,
    updateSpecialInstructions,
    clearCart,
    setTableNumber,
    setCustomerNotes,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
