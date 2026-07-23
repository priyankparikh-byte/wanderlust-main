const mongoose = require("mongoose");

/**
 * =============================================================
 *  Review Model — Schema Shape Tests
 * =============================================================
 *
 *  📖 INSTRUCTOR NOTES:
 *  ---------------------
 *  The Review model stores user feedback for listings.
 *  Key things we verify:
 *    - `rating` has min(1) and max(5) validators
 *    - `author` references the User model
 *    - `createdAt` has a default value
 *
 *  VALIDATOR INSPECTION:
 *  Mongoose stores validators in `schema.paths.<field>.validators`.
 *  Each validator has a `type` (like 'min', 'max') and a `min`/`max` value.
 * =============================================================
 */

const Review = require("../../models/review");

describe("Review Model Schema", () => {
  const schemaPaths = Review.schema.paths;

  test("should have a 'comment' field of type String", () => {
    expect(schemaPaths.comment).toBeDefined();
    expect(schemaPaths.comment.instance).toBe("String");
  });

  test("should have a 'rating' field of type Number", () => {
    expect(schemaPaths.rating).toBeDefined();
    expect(schemaPaths.rating.instance).toBe("Number");
  });

  test("should have a min validator of 1 on rating", () => {
    /**
     * Mongoose stores validators as an array on each path.
     * We dig into it to verify the business rule:
     * "Ratings must be at least 1 star"
     */
    const ratingPath = schemaPaths.rating;
    const minValidator = ratingPath.validators.find(v => v.type === "min");

    expect(minValidator).toBeDefined();
    expect(minValidator.min).toBe(1);
  });

  test("should have a max validator of 5 on rating", () => {
    const ratingPath = schemaPaths.rating;
    const maxValidator = ratingPath.validators.find(v => v.type === "max");

    expect(maxValidator).toBeDefined();
    expect(maxValidator.max).toBe(5);
  });

  test("should have a 'createdAt' field of type Date", () => {
    expect(schemaPaths.createdAt).toBeDefined();
    expect(schemaPaths.createdAt.instance).toBe("Date");
  });

  test("should have a default value for 'createdAt'", () => {
    /**
     * The default ensures that if you create a review without
     * specifying createdAt, it automatically gets the current time.
     */
    expect(schemaPaths.createdAt.defaultValue).toBeDefined();
  });

  test("should have 'author' as an ObjectId ref to 'User'", () => {
    expect(schemaPaths.author).toBeDefined();
    expect(schemaPaths.author.instance).toBe("ObjectId");
    expect(schemaPaths.author.options.ref).toBe("User");
  });
});
