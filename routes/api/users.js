const express = require('express');
const router = express.Router();
const gravatar = require('gravatar')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator/check')
const USer = require('../../models/User')

// @route  POST api/users
// @desc  Test route
// @access Pubilc 

router.post('/', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, password } = req.body;

    try {
      // see if the user exist

      let user = await USer.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exist' }] })
      }
      // Get user gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      })

      user = new USer({
        name,
        email,
        avatar,
        password
      })
      // Encript password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt)
      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      }

      jwt.sign(payload,
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