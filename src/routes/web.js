const express = require('express');
const router = express.Router();
const authController = require('../controller/AuthController');
const UserController = require('../controller/UserController');
const authMiddleware = require("../middleware/authMiddleware"); 


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/sendForgotOtp', authController.sendForgotOtp);
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the authentication API' });
});                             
router.get('/user', authMiddleware, UserController.getUserDetails);
router.get('/levelteam',  authMiddleware,UserController.levelTeam);
router.get('/directeam',  authMiddleware,UserController.direcTeam);
router.get('/fetchwallet', authMiddleware, UserController.fetchwallet);
router.get('/dynamic-upi-callback', UserController.dynamicUpiCallback);
router.get('/availbal', authMiddleware, UserController.available_balance);
router.get('/withreq', authMiddleware, UserController.withreq);
router.post('/sendotp', authMiddleware, UserController.sendotp);
router.post('/process-withdrawal', authMiddleware, UserController.processWithdrawal);
router.get('/fetchserver', authMiddleware, UserController.fetchserver);
router.post('/submitserver', authMiddleware, UserController.submitserver);
router.get('/fetchrenew', authMiddleware, UserController.fetchrenew);
router.post('/renew-server', authMiddleware, UserController.renewserver);
router.get('/investments', authMiddleware, UserController.InvestHistory);
router.get('/withdraw-history', authMiddleware, UserController.withdrawHistory);
router.post('/changePassword', authMiddleware, UserController.ChangePassword);
router.get('/fetchservers', authMiddleware, UserController.fetchservers);
router.post('/save-address/:networkType', authMiddleware, UserController.saveWalletAddress);
// router.post('/register', (req, res) => {
//   res.json({ message: 'Welcome to regiset' });
// });

module.exports = router;
