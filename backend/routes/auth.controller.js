const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { UserValidationSchema, LoginValidationSchema } = require('../utils/Validation');

// Sign up route
router.post('/signup', async (req, res) => {
  try {
    let {error, value} = UserValidationSchema.validate(req.body)

    if(error) {
      return res.json({message: error.details[0].message, status: 404})
    }

    // Check if user already exists
    const existingUser = await User.findOne({email: value.email});
    if (existingUser) {
      return res.json({ message: 'You have already registered' });
    }

    // Create a new user
    const hashedPassword = await bcrypt.hash(value.password, 10);

    const newUser = new User({ ...value, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User created successfully' , status: 200});
  } catch (error) {
    console.error('Error signing up:', error);
    return res.status(500).json({ message: 'Internal server error'});
  }
});

router.get('/users',async (req, res) => {
  try {
    let users = await User.find()
    return res.status(200).json(users);
  } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({ message: 'Internal server error' }); 
  }
})

// Sign in route
router.post('/signin', async (req, res) => {
  try {
    let {error,value} = LoginValidationSchema.validate(req.body)

    if(error) {
      return res.json({message: error.details[0].message, status: 404})
    }

    // Check if user exists
    const user = await User.findOne({ email: value.email });
    if (!user) {
      return res.json({ message: 'Invalid username or password' , status: 401});
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) {
      return res.json({ message: 'Invalid username or password', status: 401});
    }

    let signObject = {
      user_id: user.id,
      role: user.role, 
      email: user.email,
      name: user.name,
      phone: user.phone,
    }

    // Generate and sign a JWT token
    const accessToken = jwt.sign(signObject , process.env.JWT_ACCESS_TOKEN_KEY , { expiresIn: '1h'});
    const refreshToken = jwt.sign(signObject , process.env.JWT_REFRESH_TOKEN_KEY , { expiresIn: '30d'});
    let LoggedInUser = {
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role 
    }

    return res.status(201).json({ accessToken, refreshToken, user: LoggedInUser });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;
