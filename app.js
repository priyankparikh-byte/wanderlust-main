
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
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const MONGO_URL = process.env.ATLAS_URI;
 
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  }); 

async function main() {
  await mongoose.connect(MONGO_URL);
}






app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));
const store =  MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: "mysupersecretcode" ,
  },
  touchAfter: 24 * 60 * 60, // time period in seconds
});

const sessionOptions = {
  store,
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in a week
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.get("/", (req, res) => {
  return res.redirect('/listings');
});


store.on("error", function (e) {
  console.log("Session store error:", e);
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
app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
// app.listen(8080, () => {
//   console.log("server is listening to port 8080");
// });
