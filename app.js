
const express = require("express");
require('dotenv').config();

const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const review = require("./models/review.js");
const {listingSchema,reviewSchema} = require("./schema.js");
const lisitingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const redisClient = require("./redisClient.js");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

function getMongoUrl() {
  const uri = process.env.ATLAS_URI;
  if (!uri) return null;
  if (/\.mongodb\.net\/[^/?]+/.test(uri)) return uri;
  const q = uri.indexOf("?");
  if (q === -1) return uri.replace(/\/?$/, "/wanderlust");
  return uri.slice(0, q).replace(/\/?$/, "/wanderlust") + uri.slice(q);
}

const MONGO_URL = getMongoUrl();
const sessionSecret = process.env.SECRET_KEY || process.env.SECRET;

if (!MONGO_URL || !sessionSecret) {
  console.error("Missing ATLAS_URI or SECRET_KEY in environment variables.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}






app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
const store = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

const sessionOptions = {
  store,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.get("/", (req, res) => {
  return res.redirect('/listings');
});


// Mount routers after middleware so `req.body` and other middleware are available
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// app.get("/demoUser",async (req, res) => {
//   let fakeUser = new User({
//     email: "demo@example.com",
//     username: "demoUser"
//   });
//   await User.register(fakeUser, "password123");
//   res.send("Demo user created");
// });

app.use("/listings", lisitingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);






// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs",{err});
  
});
const port = process.env.PORT || 8080;

async function start() {
  try {
    await mongoose.connect(MONGO_URL, {
      tls: true,
      tlsAllowInvalidCertificates: true
    });
    console.log("connected to DB");
    app.listen(port, () => {
      console.log(`server is listening on port ${port}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
}

start();
