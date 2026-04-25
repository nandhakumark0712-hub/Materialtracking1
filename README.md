# Material Tracking System

A full-stack ERP and HRMS application built with React, Node.js, Express, and MongoDB Atlas.

## Features

- **Dashboard**: Real-time analytics and overview.
- **Material Management**: Track inventory, requests, and approvals.
- **HRMS**: Attendance tracking, leave management, and team management.
- **ERP**: Vendor management, orders, and CRM integration.
- **Chat**: Real-time communication Hub.
- **Field Visits**: Reports and visit tracking.

## Tech Stack

- **Frontend**: React (Vite), Redux Toolkit, Tailwind CSS.
- **Backend**: Node.js, Express, Mongoose, Socket.io.
- **Database**: MongoDB Atlas.

## Getting Started

1. Clone the repository.
2. Install dependencies for both frontend and backend:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Configure your `.env` file in the `backend` folder.
4. Run the development servers:
   ```bash
   # Backend
   npm start
   
   # Frontend
   npm run dev
   ```

## Robust Connection Logic

This project includes a custom MongoDB connection handler that automatically handles DNS/SRV resolution issues by falling back to direct shard connections if necessary, ensuring reliability in various network environments.
