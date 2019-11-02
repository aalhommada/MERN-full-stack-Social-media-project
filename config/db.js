const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURL');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    console.log('MongoDB connected ...')
  } catch (err) {
    console.error(err.message);
    // exit with failer
    process.exit(1)
  }
}

module.exports = connectDB;