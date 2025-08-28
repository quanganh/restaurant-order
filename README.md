# Restaurant QR Code Ordering System

A complete digital ordering solution for restaurants that allows customers to scan QR codes at tables to browse menus and place orders.

## Features

### Customer Features
- **QR Code Scanning**: Customers scan table QR codes to access the ordering system
- **Digital Menu**: Browse categorized menu items with descriptions, prices, and dietary information
- **Shopping Cart**: Add items to cart with quantity and special instructions
- **Order Placement**: Submit orders directly to the kitchen
- **Real-time Order Tracking**: Get live updates on order status
- **Service Calls**: Request waiter service with a button click

### Admin Features
- **Dashboard**: Overview of orders, revenue, and table status
- **Menu Management**: Add, edit, and manage menu items and categories
- **Order Management**: View, update, and track all orders
- **Table Management**: Manage tables and generate QR codes
- **Real-time Notifications**: Get instant alerts for new orders and service requests
- **Analytics**: Sales reports and performance metrics

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **QR Code** generation

### Frontend
- **React** with Material-UI components
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Axios** for API calls
- **Context API** for state management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd restaurant-order
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:

Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-order
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:3000
ADMIN_PASSWORD=admin123
RESTAURANT_NAME=My Restaurant
```

Frontend (.env):
```
REACT_APP_API_URL=http://localhost:5000
```

5. Seed the database with sample data:
```bash
cd backend
npm run seed
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Access the application:
- Customer interface: http://localhost:3000
- Admin interface: http://localhost:3000/admin

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

## Project Structure

```
restaurant-order/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── utils/           # Utility functions and seeders
│   └── server.js        # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── App.js       # Main app component
│   └── public/          # Static files
└── README.md
```

## API Endpoints

### Public Endpoints
- `GET /api/menu` - Get available menu items
- `POST /api/orders` - Create new order
- `GET /api/tables/:number` - Get table information
- `POST /api/tables/:number/service` - Call for service

### Admin Endpoints (Protected)
- `POST /api/auth/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status
- `GET /api/menu/all` - Get all menu items (admin view)
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

## Deployment

### Backend Deployment (Railway/Render)
1. Create account on Railway or Render
2. Connect your GitHub repository
3. Set environment variables in the dashboard
4. Deploy the backend service

### Frontend Deployment (Vercel)
1. Create account on Vercel
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set environment variables (REACT_APP_API_URL)
5. Deploy the frontend

### Database (MongoDB Atlas)
1. Create MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in backend environment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the repository.
