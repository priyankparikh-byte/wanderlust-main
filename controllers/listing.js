const Listing = require("../models/listing");
const { invalidateListingCache } = require("../utils/invalidateCache");


module.exports.index = async (req, res) => {
  const { location, minPrice, maxPrice, country, includeTaxes } = req.query;
  const conditions = [];

  if (location?.trim()) {
    const re = new RegExp(location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    conditions.push({
      $or: [{ location: re }, { country: re }, { title: re }],
    });
  }

  if (country?.trim()) {
    const re = new RegExp(country.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    conditions.push({ country: re });
  }

  const price = {};
  if (minPrice !== undefined && minPrice !== "") price.$gte = Number(minPrice);
  if (maxPrice !== undefined && maxPrice !== "") price.$lte = Number(maxPrice);
  if (Object.keys(price).length) conditions.push({ price });

  const filter = conditions.length ? { $and: conditions } : {};
  const allListings = await Listing.find(filter);

  res.render("listings/index.ejs", {
    allListings,
    query: req.query,
    includeTaxes: includeTaxes === "on",
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate({path: "reviews",populate:{path: "author",},}).populate("owner");
   if(!listing) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
   let url = req.file.path;
   let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image={url, filename};
  await newListing.save();
  await invalidateListingCache();
  req.flash("success", "Successfully made a new listing!");
  res.redirect("/listings");
  
  
};

module.exports.renderEditForm =async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }
 let originalImageUrl = listing.image.url;
 originalImageUrl = originalImageUrl.replace(/\/upload\//, "/upload/h_300,w_250/");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};


module.exports.updateListing = async (req, res) => {

  let { id } = req.params;
  
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   if(typeof req.file !== "undefined"){
  let url = req.file.path;
  let filename = req.file.filename;
  listing.image={url, filename};
  await listing.save();
  }
  await invalidateListingCache(id);
  req.flash("success", "Successfully updated the listing!");
  res.redirect(`/listings/${id}`);
};



module.exports.deleteListing =async(req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  await invalidateListingCache(id);
  req.flash("success", "Successfully deleted the listing!");
  res.redirect("/listings");
};