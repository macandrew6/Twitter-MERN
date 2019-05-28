const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const User = require('../../models/User');
const passport = require('passport');
const express = require("express");
const router = express.Router();

// get current
router.get("/current", passport.authenticate('jwt', {session: false}), (req, res) => {
  res.json({msg: 'Success'});
});

// get route
router.get("/test", (req, res) => res.json({msg: "this is the users route"}));
// post register
router.post("/register", (req, res) => {
  // const { errors, isValid } = validateRegisterInput(req.body);

  // if (!isValid) {
  //   return res.status(404).json(errors);
  // }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        // errors.name = "User already exists";
        return res.status(400).json({ email: "A user has already registered with this addresss" }); // <= json(errors)
      } else {
        const newUser = new User({
          handle: req.body.handle,
          email: req.body.email,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                const payload = { id: user.id, name: user.email };

                jwt.sign(payload, keys.secretOrKey, {expires: 3600}, (err, token) => {
                  console.log(token);
                  res.json({
                    success: true,
                    token: 'Bearer ' + token
                  });
                });
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
});

// post login
router.post('/login', (req, res) => {
  // const { errors, isValid } = validateLoginInput(req.body);

  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then(user => {
      if (!user) res.status(404).json({ email: "this user doesnt exist" });

      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            const payload = {id: user.id, name: user.email};

            jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token
              });
            });
          } else {
            // errors.password = "Incorrect password"
            return res.status(404).json({ password: "password is incorrect" }); // <= json(errors)
          }
        });
    });
});

module.exports = router;