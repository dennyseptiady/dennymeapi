const app = require('./src/app');
const { testConnection } = require('./src/config/database');

// Port untuk shared hosting (biasanya environment variable dari hosting)
const PORT = process.env.PORT || 3000;

// Bind to localhost untuk shared hosting
const HOST = process.env.HOST || '127.0.0.1';

const startServer = async () => {
  try {
    console.log('🔄 Starting server for shared hosting...');
    
    // Test database connection
    console.log('🔗 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful');
    
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on ${HOST}:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`🔗 API Base URL: http://${HOST}:${PORT}/api`);
      console.log(`💚 Health Check: http://${HOST}:${PORT}/api/health`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
    });
    
    // Handle graceful shutdown untuk shared hosting
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
      });
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Start server
startServer(); 