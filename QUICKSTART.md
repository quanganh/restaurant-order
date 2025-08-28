# Quick Start Guide

## Local Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

### Quick Setup (5 minutes)

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd restaurant-order
npm run install-all
```

2. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

3. **Seed Database**
```bash
cd backend
npm run seed
```

4. **Start Development**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start
```

### Access the Application
- **Customer Demo**: http://localhost:3000/table/1
- **Admin Panel**: http://localhost:3000/admin
- **Admin Login**: admin / admin123

## Deployment

### Free Deployment Options

#### Backend (Railway - Free Tier)
1. Create Railway account
2. Connect GitHub repo
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Random secure string
   - `CLIENT_URL`: Your Vercel frontend URL
4. Deploy

#### Frontend (Vercel - Free Tier)
1. Create Vercel account
2. Import GitHub repo
3. Set build command: `npm run build`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your Railway backend URL
5. Deploy

#### Database (MongoDB Atlas - Free Tier)
1. Create MongoDB Atlas account
2. Create free cluster
3. Add IP whitelist (0.0.0.0/0 for development)
4. Get connection string
5. Update `MONGODB_URI` in Railway

### Production URLs
After deployment, your app will be available at:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.railway.app`

## Features Available

### ✅ Implemented
- Basic routing and navigation
- Admin authentication
- Database models and API endpoints
- Socket.io real-time setup
- Deployment configuration

### 🚧 Placeholder Components (Ready for Development)
- Menu browsing and cart functionality
- Order management
- Admin dashboard
- Real-time order tracking
- QR code generation

## Next Steps for Full Implementation

1. **Menu Component**: Implement menu display and cart functionality
2. **Order Flow**: Complete order placement and tracking
3. **Admin Dashboard**: Build comprehensive management interface
4. **Real-time Features**: Implement live order updates
5. **Payment Integration**: Add payment processing
6. **Testing**: Add comprehensive test suite

## Support

The foundation is complete and ready for rapid development. All core infrastructure is in place:
- ✅ Backend API with full CRUD operations
- ✅ Frontend routing and state management
- ✅ Real-time communication setup
- ✅ Authentication and authorization
- ✅ Deployment configuration
