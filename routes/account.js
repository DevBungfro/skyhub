const express = require('express')
const router = express.Router()
const bcrypt = require("bcryptjs")

const UserSchema = require("../models/user.js")

const validator = {
  isEmail: isEmailValid,
}

var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

function isEmailValid(email) {
  if (!email)
    return false;

  if (email.length > 254)
    return false;

  var valid = emailRegex.test(email);
  if (!valid)
    return false;

  // Things Regex Can't Do
  var parts = email.split("@");
  if (parts[0].length > 64)
    return false;

  var domainParts = parts[1].split(".");
  if (domainParts.some(function(part) { return part.length > 63; }))
    return false;

  return true;
}

router.use((req, res, next) => {
  next()
})

router.get("/register", (req, res) => {
    if (req.session.user) return res.redirect("/")
  res.render("register.ejs")
})

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/")

  res.render("login.ejs")
})

router.post("/login", async (req, res) => {
  if (req.session.user) return res.redirect("/")
  try {
    const User = await UserSchema.findOne({
      email: req.body.email
    }).select("email password verified").lean();

    if (User) {
      if (!User.verified) return res.render("login.ejs", {
        type: "password",
        message: "Please verify your email before logging in."
      })
      bcrypt.compare(req.body.password, User.password).then(function(result) {
        if (result) {
          const user = {
            email: User.email,
          }

          req.session.user = user

          res.redirect("/account")
        } else {
          res.render("login.ejs", {
            type: "password",
            message: "Incorrect Password"
          })
        }
      })
    } else {
      res.render("login.ejs", {
        type: "email",
        message: "Account not found"
      })
    }
  } catch (err) {
    res.render("login.ejs", {
      type: "password",
      message: "Something went wrong, please try again later."
    })
  }
})

router.post("/register", async (req, res) => {
    if (req.session.user) return res.redirect("/")
  try {
    if (await checkDetails(req, res) == true) {
      bcrypt.hash(req.body.password, 10).then(async (hash) => {
        let token = await generateToken()
        req.body.token = token
        req.body.password = hash
        const User = new UserSchema(req.body)
        await User.save()
        res.render("register.ejs", {
          success: true,
        })
      })
    }
  } catch (err) {
    res.render("register.ejs", {
      type: "password",
      message: "Something went wrong, please try again later."
    })
  }
})

router.get("/verify/:token", async (req, res) => {
  const token = req.params.token

  if (token) {
    const User = await UserSchema.findOne({
      token: token
    })

    if (User) {
      User.verified = true
      User.token = null
      await User.save()

      res.send("Successfully verified, you may now login.")
    } else {
      res.send("User not found or already verified.")
    }
  }
})

async function checkDetails(req, res) {
  if (req.body.password != req.body.confirmpassword) {
    res.render("register.ejs", {
      type: "password",
      message: "Passwords do not match!"
    })
  }

  if (!req.body.email) {
    res.render("register.ejs", {
      type: "email",
      message: "Email is required!"
    })
    return false

  }

  if (!validator.isEmail(req.body.email)) {
    res.render("register.ejs", {
      type: "email",
      message: "Email is not valid!"
    })

    return false
  }



  const User = await UserSchema.findOne({
    email: req.body.email
  }).select("email").lean();

  if (User) {
    res.render("register.ejs", {
      type: "email",
      message: "User with email already found!"
    })
    return false

  }


  return true
}

async function generateToken() {
  return Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 3) + "-" + Math.random().toString(36).substr(2, 4)
}

module.exports = router