const { User } = require('./models/User');

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // use user.id from middleware

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUserDetails };
