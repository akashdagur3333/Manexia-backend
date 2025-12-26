require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db.config');

const PORT = process.env.PORT || 5000;


app.listen(PORT, async () => {
  console.log(`🚀 Manexia API running on port ${PORT}`);
  await connectDB();
});
