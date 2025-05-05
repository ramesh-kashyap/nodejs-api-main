const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Withdraw = require('../models/Withdraw');
const Investment = require('../models/Investment');
const getUserHistory = async (req, res) => {
    try {
      const user = req.user;
  
      if (!user || !user.id) {
        return res.status(400).json({ error: "User not authenticated" });
      }
  
      const userId = user.id;
  
      // Fetch from each model
      const [investmentHistory, incomeHistory, withdrawHistory] = await Promise.all([
        Investment.findAll({
          where: { user_id: userId },
          order: [['created_at', 'DESC']]
        }),
        Income.findAll({
          where: { user_id: userId },
          order: [['created_at', 'DESC']]
        }),
        Withdraw.findAll({
          where: { user_id: userId },
          order: [['created_at', 'DESC']]
        })
      ]);
  
      res.json({
        success: true,
        investment: investmentHistory,
        income: incomeHistory,
        withdraw: withdrawHistory
      });
  
    } catch (error) {
      console.error("Error fetching histories:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = {getUserHistory};
