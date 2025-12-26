require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
// const connectDB = require('./config/db.config');

const PORT = process.env.PORT || 5000;
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  }
};
app.listen(PORT, async () => {
  connectDB()
  console.log(`🚀 Manexia API running on port ${PORT}`);
});
