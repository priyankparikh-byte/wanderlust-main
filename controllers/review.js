const review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { invalidateListingCache } = require("../utils/invalidateCache");


module.exports.createReview = async(req, res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  await invalidateListingCache(listing._id);
  req.flash("success", "Successfully added a new review!");
  res.redirect(`/listings/${listing._id}`);

};

module.exports.deleteReview = async(req, res) => {
  let {id, reviewId} = req.params;
  await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
  await review.findByIdAndDelete(reviewId);
  await invalidateListingCache(id);
  req.flash("success", "Successfully deleted the review!");
  res.redirect(`/listings/${id}`);
};