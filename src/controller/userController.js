const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Income = require('../models/Income');
const Withdraw = require('../models/Withdraw');
const { calculateAvailableBalance } = require("../helper/helper");
const axios = require('axios');
const sequelize = require('../config/connectDB');

const available_balance = async (req, res) => { 
    try {
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated!" });
      }
  
      const user = await User.findOne({ where: { id: userId } });
  
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      const totalCommission = await Income.sum('comm', { where: { user_id: userId } }) || 0;   
      if (totalCommission <= 0) {
        return res.status(400).json({ message: "You don't have enough balance to withdraw." });
      }
      const totalWithdraw = await Withdraw.sum('amount', { where: { user_id: userId } }) || 0;
      const availableBal = totalCommission - totalWithdraw;
  
      return res.status(200).json({
        success: true,
        AvailBalance: availableBal.toFixed(2),
        message: "Amount fetched successfully!"
      });
  
    } catch (error) {
      console.error("Something went wrong:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

//   const availbalance = async (req, res) => { 
//     try {
//       const userId = req.user?.id;
  
//       if (!userId) {
//         return res.status(401).json({ message: "User not authenticated!" });
//       }
  
//       const user = await User.findOne({ where: { id: userId } });
  
//       if (!user) {
//         return res.status(404).json({ message: "User not found!" });
//       }
//       const totalCommission = await Income.sum('comm', { where: { user_id: userId } }) || 0;   
//       if (totalCommission <= 0) {
//         return res.status(400).json({ message: "You don't have enough balance to withdraw." });
//       }
//       const totalWithdraw = await Withdraw.sum('amount', { where: { user_id: userId } }) || 0;
//       const availableBal = totalCommission - totalWithdraw;
  
//       return res.status(200).json({
//         success: true,
//         AvailBalance: availableBal.toFixed(2),
//         message: "Amount fetched successfully!"
//       });
  
//     } catch (error) {
//       console.error("Something went wrong:", error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   };

const fetchTeamRecursive = async (userId, allMembers = []) => {
    const directMembers = await User.findAll({
        where: { sponsor: userId },
        attributes: ['id', 'name','username', 'email', 'phone', 'sponsor']
    });

    for (const member of directMembers) {
        allMembers.push(member);
        await fetchTeamRecursive(member.id, allMembers); // recursively fetch members under this member
    }

    return allMembers;
};

const levelTeam = async (req, res) => {
    try {
        const userId = req.user.id; // from JWT token

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized!" });
        }

        // Fetch all team recursively
        const team = await fetchTeamRecursive(userId);

        return res.status(200).json({
            message: "Team fetched successfully!",
            totalMembers: team.length,
            team
        });

    } catch (error) {
        console.error("Error fetching team:", error.message);
        return res.status(500).json({ error: "Server Error", details: error.message });
    }
};

const direcTeam = async (req, res) => {
    try {
        const userId = req.user.id; // from JWT token

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized!" });
        }

        // Fetch all team recursively
        const team = await User.findAll({where:{sponsor: userId}});

        return res.status(200).json({
            message: "Team fetched successfully!",
            totalMembers: team.length,
            team
        });

    } catch (error) {
        console.error("Error fetching team:", error.message);
        return res.status(500).json({ error: "Server Error", details: error.message });
    }
};

const fetchwallet = async (req, res) => {    
    // Construct the URL  
    try {
        const user = req.user;
        if(!user){
            return res.json(message, "user not Authancate");
        }
       const  refid = user.username;
       const currency = req.query.type || 'bep20'; // default to bep20
       const address = currency === 'trc20'
      ? 'TJPhCR5fbJH9fS7ubEQz59FQ4hLbWd9jAh'
      : '0xfff46712792FFeb9f93c530d2413fb99C67332b7';
      const apiUrl = `https://api.cryptapi.io/${currency}/usdt/create/?callback=https://api.aironetwork.in/api/auth/dynamic-upi-callback?refid=${refid}&address=${address}&pending=0&confirmations=1&email=rameshkashyap8801@gmail.com&post=0&priority=default&multi_token=0&multi_chain=0&convert=0`;

      // Call the external API
      const response = await axios.get(apiUrl); 
      delete response.data.callback_url;
    //   console.log("Wallet Data:", response.data);
      if (response.data.status === "success") {
        return res.status(200).json({
          success: true,
          data: response.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Failed to create wallet address",
          data: response.data
        });
      }
  
    } catch (error) {
      console.error("Error calling external API:", error.response?.data || error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const dynamicUpiCallback = async (req, res) => {
    console.log(req.query);
    try {
      const queryData = req.query;
      console.log('Incoming callback data:', JSON.stringify(queryData));  
      // Save raw JSON
     
  
      const validAddresses = [
        "0xfff46712792FFeb9f93c530d2413fb99C67332b7",
        "TJPhCR5fbJH9fS7ubEQz59FQ4hLbWd9jAh"
      ];  
      if (
        validAddresses.includes(queryData.address_out) &&
        queryData.result === "sent" &&
        ['bep20_usdt', 'trc20_usdt'].includes(queryData.coin)
      ) {
        const txnId = queryData.txid_in;
        const userName = queryData.refid;
  
        const existingInvestment = await BuyFund.findOne({ where: { txn_no: txnId } });
        if (!existingInvestment) {
          console.log(`Processing new transaction: ${txnId} for user: ${userName}`);
  
          const amount = parseFloat(queryData.value_coin).toFixed(2);
          const blockchain = queryData.coin === 'bep20_usdt' ? 'USDT_BSC' : 'USDT_TRON';
  
          const user = await User.findOne({ where: { username: userName } });
          if (!user) {
            return res.json({
              message: 'User not found',
              status: false
            });
          }
          if(user){
            await User.increment({usdt:amount},{where:{ id: user.id}})
          }          
          const now = new Date();
          const invoice = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
  
          await BuyFund.create({
            txn_no: txnId,
            user_id: user.id,
            user_id_fk: user.username,
            amount: amount,
            type: blockchain,
            status: 'Approved',
            bdate: now,
            createdAt: now,
          });
  
          // ✅ Update usdtBalance in users table
          const newBalance = parseFloat(user.usdtBalance || 0) + parseFloat(amount);
          await user.update({ usdtBalance: newBalance });
        }
      }
  
      return res.json({
        message: 'Callback processed',
        status: true
      });
    } catch (err) {
      console.error('UPI Callback Error:', err.message);
      return res.json({
        message: 'Failed',
        status: false
      });
    }
  };

 
    
  const withfatch = async (req, res) => { 
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated!" });
      }  
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }  
    //   const amount = parseFloat(amount);
      return res
        .status(200).json({success: true, data: user, message: "Amount fetch successfully!" });
    } catch (error) {
      console.error("Something went wrong:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  const Cwithdarw = async (req, res) => {
    const { amount, currency, network, wallet } = req.body;
  
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated!" });
      }
  
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
  
    //   const amount = parseFloat(amount);
      if (amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount!" });
      }      
      if (currency === "USDT") {
        if (user.usdt < amount) {
          return res.status(400).json({ message: "Insufficient USDT balance!" });
        }        
        await User.update(
          { usdt: user.usdt - amount },
          { where: { id: userId } }
        );
        
      } else if (currency === "AIRO") {
        if (user.airo < amount) {
          return res.status(400).json({ message: "Insufficient AIRO balance!" });
        }
        await User.update(
          { airo: user.airo - amount },
          { where: { id: userId } }
        );
      } else {
        return res.status(400).json({ message: "Unsupported currency!" });
      }
     const cutAmount = (amount / 100) * 5; // 5% charge
    const payable = amount - cutAmount;
    await Withdraw.create({
        user_id: userId,
        amount: amount,
        payable_amt: payable,
        charge: cutAmount,
        payment_mode: currency,
        account: wallet,
        network,
      });
  
      return res
        .status(200).json({ message: "Withdrawal request submitted successfully!" });
    } catch (error) {
      console.error("Something went wrong:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  const withreq = async (req, res) => { 
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated!" });
      }
  
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      } 
    //   const amount = parseFloat(amount);
      return res
        .status(200).json({success: true, trc20: user.usdtTrc20, bep20: user.usdtBep20});
    } catch (error) {
      console.error("Something went wrong:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const sendotp = async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated!" });
      }
  
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
  
      const email = user.email;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const createdAt = new Date(); 
      const [existing] = await sequelize.query(
        'SELECT * FROM password_resets WHERE email = ?',
        {
          replacements: [email],
          type: sequelize.QueryTypes.SELECT,
        }
      );
  
      if (existing) {
        await sequelize.query(
          'DELETE FROM password_resets WHERE email = ?',
          {
            replacements: [email],
            type: sequelize.QueryTypes.DELETE,
          }
        );
      }
      await sequelize.query(
        'INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, ?)',
        {
          replacements: [email, otp, createdAt],
          type: sequelize.QueryTypes.INSERT,
        }
      );
      return res.status(200).json({ success: true, message: "OTP sent successfully" });
  
    } catch (error) {
      console.error("Something went wrong:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  const processWithdrawal = async (req, res) => {
    console.log(req.body);
    try {
      const userId = req.user?.id;
      const { wallet ,amount, verificationCode , type} = req.body;
  
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated!" });
      }
  
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found!" });
      }
      const [otpRecord] = await sequelize.query(
        'SELECT * FROM password_resets WHERE email = ? AND token = ? ORDER BY created_at DESC LIMIT 1',
        {
          replacements: [user.email, verificationCode],
          type: sequelize.QueryTypes.SELECT
        }
      );
  
      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP!" });
      }
  
      const totalCommission = await Income.sum('comm', { where: { user_id: userId } }) || 0;
      const totalWithdraw = await Withdraw.sum('amount', { where: { user_id: userId } }) || 0;
      const availableBal = totalCommission - totalWithdraw;
  
      if (parseFloat(amount) > availableBal) {
        return res.status(400).json({ message: "Insufficient balance!" });
      }
      await Withdraw.create({
        user_id: userId,
        user_id_fk: user.username,
        amount: parseFloat(amount),
        status: 'pending',
        account: wallet,
        payment_mode: type, 
      });
  
      return res.status(200).json({
        success: true,
        message: "Withdrawal request submitted successfully!"
      });
  
    } catch (error) {
      console.error("Something went wrong:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
  


module.exports = { levelTeam, direcTeam ,fetchwallet, dynamicUpiCallback, available_balance, withfatch, withreq, sendotp,processWithdrawal};