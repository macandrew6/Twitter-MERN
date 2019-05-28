// initiating server
const express = require("express");
const app = express();
const mongoose = require('mongoose');
// body-parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// requiring keys
const db = require('./config/keys').mongoURI;
// requiring routes
const users = require("./routes/api/users");
const tweets = require("./routes/api/tweets");

// passport <= must go after we register our model
const passport = require('passport');
app.use(passport.initialize());
require('./config/passport')(passport);

// mongoose connecting to db
mongoose
  .connect(db, { useNewUrlParser: true})
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => (err));

// initial connect sends back a server response
app.get("/", (req, res) => {
});
// using defined routes
app.use("/api/users", users);
app.use("/api/tweets", tweets);

// sets port for app.js to listen to.
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));