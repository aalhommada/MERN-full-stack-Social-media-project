const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator/check')
const bcrypr = require('bcryptjs')
const auth = require('../../middleware/auth')
const User = require('../../models/User')

// @route  GET api/auth
// @desc  Test route
// @access Pubilc 

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})


// @route  POST api/auth
// @desc  authenticate user and get token
// @access Pubilc 

router.post('/', [

  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;

    try {
      // see if the user exist

      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] })
      }
      // Get user gravatar


      const isMatch = await bcrypr.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] })
      }

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token })
        }
      )
      // Return jsonwebtoken



      // res.send('User registered')
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error')
    }




  })

module.exports = router;

module.exports = router;