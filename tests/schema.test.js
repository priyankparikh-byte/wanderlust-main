const { listingSchema, reviewSchema } = require("../schema");

/**
 * =============================================================
 *  Joi Schema Validation Tests
 * =============================================================
 *
 *  📖 INSTRUCTOR NOTES:
 *  ---------------------
 *  Joi is a DATA VALIDATION library. Before data hits your database,
 *  Joi checks that it matches a defined shape (schema).
 *
 *  Think of it as a BOUNCER at a club:
 *    ✅ "You have all required fields? Come in."
 *    ❌ "Missing a title? Sorry, you're not getting in."
 *
 *  These schemas are used in your middleware (validateListing,
 *  validateReview) to reject bad data BEFORE it reaches Mongoose.
 *
 *  KEY CONCEPT: `schema.validate(data)` returns `{ error, value }`.
 *  If `error` is undefined → data is valid. Otherwise it contains
 *  details about what went wrong.
 * =============================================================
 */

describe("Listing Schema (Joi)", () => {

  // Helper: a valid listing object that passes all validation
  const validListing = {
    listing: {
      title: "Cozy Beach House",
      description: "A beautiful house by the ocean",
      price: 1500,
      location: "Goa",
      country: "India",
    },
  };

  test("should pass with all required fields", () => {
    const { error } = listingSchema.validate(validListing);
    expect(error).toBeUndefined();
  });

  test("should fail when title is missing", () => {
    const data = {
      listing: { ...validListing.listing, title: undefined },
    };
    // Delete it fully to simulate a missing field
    delete data.listing.title;

    const { error } = listingSchema.validate(data);
    expect(error).toBeDefined();
    /**
     * error.details is an ARRAY of all validation failures.
     * We check that at least one mentions "title".
     */
    expect(error.details[0].path).toContain("title");
  });

  test("should fail when description is missing", () => {
    const data = {
      listing: { ...validListing.listing },
    };
    delete data.listing.description;

    const { error } = listingSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("description");
  });

  test("should fail when price is negative", () => {
    const data = {
      listing: { ...validListing.listing, price: -100 },
    };

    const { error } = listingSchema.validate(data);
    expect(error).toBeDefined();
    /**
     * Joi's min(0) constraint means price must be >= 0.
     * A negative price makes no sense for a listing!
     */
    expect(error.details[0].path).toContain("price");
  });

  test("should fail when price is missing", () => {
    const data = {
      listing: { ...validListing.listing },
    };
    delete data.listing.price;

    const { error } = listingSchema.validate(data);
    expect(error).toBeDefined();
  });

  test("should fail when location is missing", () => {
    const data = {
      listing: { ...validListing.listing },
    };
    delete data.listing.location;

    const { error } = listingSchema.validate(data);
    expect(error).toBeDefined();
  });

  test("should fail when country is missing", () => {
    const data = {
      listing: { ...validListing.listing },
    };
    delete data.listing.country;

    const { error } = listingSchema.validate(data);
    expect(error).toBeDefined();
  });

  test("should allow empty string for image", () => {
    /**
     * The schema uses `.allow('', null)` for image.
     * This is because image upload is optional — you might
     * create a listing first and add a photo later.
     */
    const data = {
      listing: { ...validListing.listing, image: "" },
    };

    const { error } = listingSchema.validate(data);
    expect(error).toBeUndefined();
  });

  test("should allow null for image", () => {
    const data = {
      listing: { ...validListing.listing, image: null },
    };

    const { error } = listingSchema.validate(data);
    expect(error).toBeUndefined();
  });

  test("should fail when the listing wrapper object is missing", () => {
    /**
     * The schema expects { listing: { ... } }, not just { title: ... }.
     * This matches how Express parses form data with name="listing[title]".
     */
    const data = {
      title: "No wrapper",
      description: "Missing listing key",
      price: 100,
      location: "Goa",
      country: "India",
    };

    const { error } = listingSchema.validate(data);
    expect(error).toBeDefined();
  });
});


describe("Review Schema (Joi)", () => {

  const validReview = {
    review: {
      rating: 4,
      comment: "Great place to stay!",
    },
  };

  test("should pass with valid rating and comment", () => {
    const { error } = reviewSchema.validate(validReview);
    expect(error).toBeUndefined();
  });

  test("should fail when rating is below 1", () => {
    const data = {
      review: { rating: 0, comment: "Too low" },
    };

    const { error } = reviewSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("rating");
  });

  test("should fail when rating is above 5", () => {
    const data = {
      review: { rating: 6, comment: "Too high" },
    };

    const { error } = reviewSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("rating");
  });

  test("should fail when comment is missing", () => {
    const data = {
      review: { rating: 3 },
    };

    const { error } = reviewSchema.validate(data);
    expect(error).toBeDefined();
    expect(error.details[0].path).toContain("comment");
  });

  test("should fail when rating is missing", () => {
    const data = {
      review: { comment: "No rating" },
    };

    const { error } = reviewSchema.validate(data);
    expect(error).toBeDefined();
  });

  test("should accept boundary value rating = 1", () => {
    const data = {
      review: { rating: 1, comment: "Minimum rating" },
    };
    const { error } = reviewSchema.validate(data);
    expect(error).toBeUndefined();
  });

  test("should accept boundary value rating = 5", () => {
    /**
     * BOUNDARY TESTING: Always test min and max values.
     * Off-by-one errors are incredibly common!
     */
    const data = {
      review: { rating: 5, comment: "Maximum rating" },
    };
    const { error } = reviewSchema.validate(data);
    expect(error).toBeUndefined();
  });
});
