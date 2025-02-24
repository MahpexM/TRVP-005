const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const routes = require('./routes');
const helmet = require('helmet'); // Библиотека для установки заголовков безопасности

const app = express();

// Настройка Content Security Policy
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], 	// Разрешаем встроенные стили
        scriptSrc: ["'self'", "'unsafe-inline'"], 	// Разрешаем встроенные скрипты
    },
}));
app.use(bodyParser.json());
app.use(express.static('assets'));
app.use(express.static('public'));
app.use('/', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}...`);
});
