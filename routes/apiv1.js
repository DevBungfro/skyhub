const express = require('express')
const router = express.Router()

const KeySchema = require("../models/key.js")

router.use((req, res, next) => {
  next()
})

router.get("/generate-key", async (req, res) => {
  let key = await generateKey()
  res.json({ key: key })
})

router.post("/check-key", async (req, res) => {
  let valid = await checkKey(req.body.key)
  res.json({ valid: valid })
})

router.post("/deactivate-key", async (req, res) => {
  if (req.session.user.email == "creepermc234@gmail.com") {
    const KeyFound = await KeySchema.findOneAndUpdate({
      key: req.body.key
    }, {
      status: "Inactive"
    }).select("key status").lean();

    res.json({ success: KeyFound ? true : false })
    return
  }
  res.json({ message: "Unauthorized" })
  return
})


function randLetter() {
  var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  var letter = letters[Math.floor(Math.random() * letters.length)];
  return letter
}

function useRegex(input) {
  let regex = /^sky\-[A-Z]{5}\-[A-Z]{5}\-[A-Z]{2}$/i;
  return regex.test(input);
}

async function generateKey() {
  let key = [..."sky-xxxxx-xxxxx-xx"]

  key.forEach((letter, index) => {
    if (letter == "x") {
      key[index] = randLetter()
    }
  })

  key = key.toString();
  key = key.replaceAll(',', '');
  key = key.toUpperCase();

  const KeyFound = await KeySchema.findOne({
    key: key
  }).select("key").lean();

  if (KeyFound) {
    return generateKey()
  }



  const NewKey = new KeySchema({
    key: key,
    status: "Dormant"
  })

  await NewKey.save()

  return key
}

async function checkKey(key) {
  let valid
  if (!useRegex(key)) {
    return false
  }

  try {
    const KeyFound = await KeySchema.findOneAndUpdate({
      key: key
    }, {
      status: "Active"
    }).select("key status").lean();

    if (KeyFound) {
      KeyFound.status = "Active"
      valid = true
    }

  } catch (err) {
    console.log(err)
    valid = false
  }

  return valid

}

module.exports = router;
