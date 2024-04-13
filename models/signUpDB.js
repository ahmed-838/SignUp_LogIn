const mongoose = require('mongoose');

// Define a Mongoose schema for the user data
const userSchema
    = new mongoose.Schema({
    username: String,
    email: String,
    phone: String,
    gender: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Function to connect to MongoDB
async function signUpDB() {
  try {
      await mongoose.connect('mongodb://localhost:27017/myapp');
      console.log("Database connected successfully");
  } catch (err) {
      console.error("Error connecting to database:", err);
  }
}


module.exports = { User, connectSignUp: signUpDB };
