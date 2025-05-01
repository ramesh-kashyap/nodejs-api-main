const sequelize = require('../config/connectDB');
const bcrypt = require("bcryptjs");
require('dotenv').config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");




const register = async (req, res) => {
    try {
        const { phone, email, password, sponsor } = req.body;
        
        if ( !phone || !email || !password || !sponsor) {
            return res.status(400).json({ error: "All fields are required!" });
        }
  
        const existingUser = await User.findOne({where: { email: email ,  phone: phone } });
        
        
        if (existingUser) {
            return res.status(400).json({ error: "Email or Phone already exists!" });
        }
  
        // Check if sponsor exists
        const sponsorUser = await User.findOne({
            where: {
                username: sponsor  // Match the sponsor's username
            }
        });
        if (!sponsorUser) {
            return res.status(400).json({ error: "Sponsor does not exist!" });
        }
  
        // Generate username & transaction password
        const username = Math.random().toString(36).substring(2, 10);
        const tpassword = Math.random().toString(36).substring(2, 8);
  
        // Hash passwords
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedTPassword = await bcrypt.hash(tpassword, 10);
  
        // Get parent ID
        const lastUser = await User.findOne({
            order: [['id', 'DESC']]
        });
        const parentId = lastUser ? lastUser.id : null;
        // Provide a default for sponsor level if it's undefined or null
        const sponsorLevel = (sponsorUser.level !== undefined && sponsorUser.level !== null)
            ? sponsorUser.level
            : 0;
  
        // Construct new user object
        const newUser = {
            phone,
            email,
            username,
            password: hashedPassword,
            tpassword: hashedTPassword,
            PSR: password,
            TPSR: tpassword,
            sponsor: sponsorUser.id,
            level: sponsorLevel + 1,  // Default to 0 if sponsor level is not defined, then add 1
            ParentId: parentId
        };
  
        // Insert new user into the database
        await User.create(newUser);
        return res.status(201).json({ message: "User registered successfully!", username });
  
    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({ error: "Server error", details: error.message });
    }
};



const login = async (req, res) => {

    try {
      // Destructure username and password from the request body.
      const { email, password } = req.body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email address" });
      }
      if (!email || !password) {
        return res.status(400).json({ error: "Username and Password are required!" });
      }
         
      // Find the user using Sequelize
      const user = await User.findOne({ where: { email } });
       
      if (!user) {
        return res.status(400).json({ error: "User not found!" });

      }
      // Compare the provided password with the stored hashed password.
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials!" });
      }
  
      // Generate a JWT token.
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,  
       
      );
  
      return res.status(200).json({
        status:true,
        message: "Login successful!",
        username: user.username,
        token,
      });
    } catch (error) {
      console.error("Error:", error.message);
      return res.status(500).json({ status:false , error: "Server error", details: error.message });
    }
  };
  const getUserDetails = async (req, res) => {
    try {
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated!" });
      }
  
      const user = await User.findOne({ where: { id: userId } });
  
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
  
      return res.status(200).json({
        id: user.id,
        username: user.username,
        name: user.name, // Assuming your model has a 'name' field
        email: user.email, // Assuming 'email' field exists in the user model
        message: "User details fetched successfully"
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
module.exports = { register ,login,getUserDetails };
