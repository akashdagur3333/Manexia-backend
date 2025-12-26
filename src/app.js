const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const errorMiddleware = require('./shared/middlewares/error.middleware');

const app = express();

app.use(cors({origin:"*"}));
app.use(express.json());
app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });
app.use('/', routes);
app.use(errorMiddleware);

module.exports = app;
