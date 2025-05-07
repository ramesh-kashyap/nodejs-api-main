const express = require('express');
const router = express.Router();
const authController = require('../controller/AuthController');
const UserController = require('../controller/UserController');
const authMiddleware = require("../middleware/authMiddleware"); // JWT Auth Middleware
const TeamController = require("../controller/TeamController"); 

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the authentication API' });
});

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
router.get('/fetchservers', authMiddleware, UserController.fetchservers);
router.post('/sendtrade', authMiddleware, UserController.sendtrade);
router.get('/runingtrade', authMiddleware, UserController.runingtrade);
router.get('/Getinvate', authMiddleware, TeamController.Getinvate);
router.get("/team", authMiddleware ,TeamController.getTeam);
router.get('/list', authMiddleware,TeamController.listUsers);
router.get('/serverc', authMiddleware, UserController.serverc);


// router.post('/register', (req, res) => {
//   res.json({ message: 'Welcome to regiset' });
// });

module.exports = router;
