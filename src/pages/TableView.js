import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { useSocket } from '../contexts/SocketContext';
import { useCart } from '../contexts/CartContext';
import { tablesAPI } from '../services/api';

const TableView = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const { joinTable } = useSocket();
  const { setTableNumber } = useCart();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const response = await tablesAPI.getByNumber(tableNumber);
        setTable(response.data);
        setTableNumber(parseInt(tableNumber));
        joinTable(tableNumber);
      } catch (err) {
        setError('Table not found or unavailable');
      } finally {
        setLoading(false);
      }
    };

    fetchTable();
  }, [tableNumber, joinTable, setTableNumber]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom color="primary">
            Table {table.number}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Welcome! You're seated at table {table.number}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Capacity: {table.capacity} people
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate(`/menu/${tableNumber}`)}
              sx={{ mb: 2 }}
            >
              View Menu & Order
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate(`/order-status/${tableNumber}`)}
              sx={{ mb: 2 }}
            >
              View Order Status
            </Button>
            
            <Button
              variant="text"
              size="large"
              fullWidth
              onClick={() => {
                // Call service functionality will be implemented
                alert('Service called! Staff will be with you shortly.');
              }}
            >
              Call for Service
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TableView;
