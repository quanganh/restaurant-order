import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SocketProvider } from './contexts/SocketContext';
import { CartProvider } from './contexts/CartContext';
import './App.css';

// Pages
import Home from './pages/Home';
import TableView from './pages/TableView';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import OrderStatus from './pages/OrderStatus';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import MenuManagement from './pages/admin/MenuManagement';
import OrderManagement from './pages/admin/OrderManagement';
import TableManagement from './pages/admin/TableManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b35',
      light: '#ff8c66',
      dark: '#cc3300'
    },
    secondary: {
      main: '#2c3e50',
      light: '#566983',
      dark: '#1a252f'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/table/:tableNumber" element={<TableView />} />
                <Route path="/menu/:tableNumber" element={<Menu />} />
                <Route path="/cart/:tableNumber" element={<Cart />} />
                <Route path="/order-status/:tableNumber" element={<OrderStatus />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/menu" element={<MenuManagement />} />
                <Route path="/admin/orders" element={<OrderManagement />} />
                <Route path="/admin/tables" element={<TableManagement />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </SocketProvider>
    </ThemeProvider>
  );
}

export default App;
