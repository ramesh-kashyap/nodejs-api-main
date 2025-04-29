const express = require('express');
const router = express.Router();
const authController = require('../controller/AuthController');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the authentication API' });
});
// router.get('/me', userController.getUserDetails);
// router.post('/register', (req, res) => {
//   res.json({ message: 'Welcome to regiset' });
// });

module.exports = router;
