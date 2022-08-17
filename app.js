// CREATED BY BUNGFRO (FOR HIDDENDEVS)
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const Keys = require("./models/key.js")

const mongoose = require("mongoose")

const ApiRouterV1 = require("./routes/apiv1.js")
const AccountRouter = require("./routes/account.js")

const StatusColors = {
  "Dormant": "Gray",
  "Inactive": "Red",
  "Active": "Lime"
}

const path = require('path');

const port = 3000

mongoose.connect(process.env.MONGOOSE_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, "assets")));

app.set('view engine', 'ejs');

// Session
app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret:
      process.env.session_secret,
    resave: false,
    saveUninitialized: false
  })
);

// Routes
app.use("/api/v1", ApiRouterV1)
app.use("/account", AccountRouter)


app.get('/', (req, res) => {
  res.render('home.ejs')
})

app.get('/admin', async (req, res) => {

  if (req.session.user && req.session.user.email == "creepermc234@gmail.com") {
    const pageOptions = {
      page: parseInt(req.query.page, 10) || 0,
      limit: parseInt(8, 10) || 8
    }

    let AllKeys = await findPage(pageOptions)
    let countDocuments = await Keys.countDocuments()
    let lastPage = Math.floor(countDocuments / 5)

    res.render("admin.ejs", {
      keys: AllKeys,
      colors: StatusColors
    })
  }
})

async function findPage(pageOptions) {
  return Keys.find()
    .sort({ updatedAt: -1 })
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)

}

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});