const createServer = require('./api');

async function startServer() {
  try {
    // Create server (инициализация БД теперь выполняется внутри createServer)
    const app = await createServer();
    
    // Start listening
    const port = 3001; // Force port 3001 to avoid conflicts
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      console.log(`API available at http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 