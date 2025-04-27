const createServer = require('./api');
const { testConnection, initDatabase } = require('./database');
const path = require('path');
const fs = require('fs');

async function startServer() {
  try {
    console.log('----- Запуск музыкального сервера -----');
    
    // Проверяем наличие директории данных
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      console.log('Создаем директорию для данных:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create and start server (инициализация БД теперь выполняется внутри createServer)
    console.log('Инициализация веб-сервера...');
    const app = await createServer();
    const PORT = process.env.PORT || 3002;
    
    app.listen(PORT, () => {
      console.log(`\n✅ Сервер успешно запущен!`);
      console.log(`🎵 Музыкальный API доступен по адресу: http://localhost:${PORT}/api`);
      console.log(`🔐 Тестовый пользователь: demo@example.com / password`);
      console.log(`🔐 Админ: admin@example.com / admin123`);
      console.log(`📁 База данных: ${path.join(dataDir, 'chord.sqlite')}`);
      console.log(`\nНажмите Ctrl+C для завершения работы сервера`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 