import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          Welcome to My Restaurant
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Digital Ordering Made Simple
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Customer Demo
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/table/1')}
                sx={{ mt: 2 }}
              >
                Try Demo (Table 1)
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Admin Panel
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                onClick={() => navigate('/admin')}
                sx={{ mt: 2 }}
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
