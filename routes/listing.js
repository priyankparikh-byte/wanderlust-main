const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const { isLoggedIn, isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage: storage });
const { cacheMiddleware } = require("../utils/cache.js");

const indexCacheKey = (req) => `listings:index:${JSON.stringify(req.query)}`;
const showCacheKey = (req) => `listing:${req.params.id}`;

router.route("/")
.get(cacheMiddleware(300, indexCacheKey), wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));


//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(cacheMiddleware(600, showCacheKey), wrapAsync(listingController.showListing))
.put(  isLoggedIn
  ,isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
.delete( isLoggedIn,
  isOwner, wrapAsync(listingController.deleteListing));


//Edit Route
router.get("/:id/edit", isLoggedIn
  ,isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;