const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const net = require('net');

// Function to check if port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
};

// Function to find available port
const findAvailablePort = async (preferredPorts) => {
  for (const port of preferredPorts) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return 0; // Fallback to auto-assign
};

// Test database connection before starting server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    let PORT = process.env.PORT;
    if (!PORT) {
      // Try common development ports in order
      const preferredPorts = [3000];
      PORT = await findAvailablePort(preferredPorts);
    }
    
    const server = app.listen(PORT, () => {
      const actualPort = server.address().port;
      console.log(`🚀 Server is running on port ${actualPort}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${actualPort}/api`);
      console.log(`💚 Health Check: http://localhost:${actualPort}/api/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Auto-reload enabled. Edit files to see changes!`);
      }
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is busy, trying to find another port...`);
        // Retry with auto-assign
        const retryServer = app.listen(0, () => {
          const actualPort = retryServer.address().port;
          console.log(`🚀 Server is running on port ${actualPort}`);
          console.log(`🔗 API Base URL: http://localhost:${actualPort}/api`);
        });
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer(); 