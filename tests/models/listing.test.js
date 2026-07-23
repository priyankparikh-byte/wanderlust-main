const mongoose = require("mongoose");

/**
 * =============================================================
 *  Listing Model — Schema Shape Tests
 * =============================================================
 *
 *  📖 INSTRUCTOR NOTES:
 *  ---------------------
 *  These tests verify the SCHEMA DEFINITION — they check that
 *  the Mongoose schema has the correct fields, types, and
 *  constraints WITHOUT connecting to a database.
 *
 *  HOW IT WORKS:
 *  Mongoose stores the schema definition in `Model.schema.paths`.
 *  Each path has metadata like `instance` (type), `isRequired`,
 *  and `options` (ref, min, max, etc.).
 *
 *  This is like checking a BLUEPRINT before building a house —
 *  we verify the design is correct before any data is stored.
 * =============================================================
 */

// We require the model — Mongoose registers the schema even
// without a DB connection. This is safe for unit testing.
const Listing = require("../../models/listing");

describe("Listing Model Schema", () => {
  const schemaPaths = Listing.schema.paths;

  test("should have a 'title' field of type String", () => {
    expect(schemaPaths.title).toBeDefined();
    expect(schemaPaths.title.instance).toBe("String");
  });

  test("should require 'title'", () => {
    /**
     * `isRequired` is true when the schema specifies `required: true`.
     * This means Mongoose will reject documents without a title.
     */
    expect(schemaPaths.title.isRequired).toBe(true);
  });

  test("should have a 'description' field of type String", () => {
    expect(schemaPaths.description).toBeDefined();
    expect(schemaPaths.description.instance).toBe("String");
  });

  test("should have an 'image.url' field of type String", () => {
    /**
     * Nested fields in Mongoose use dot notation in schema.paths.
     * `image.url` and `image.filename` are sub-fields of the image object.
     */
    expect(schemaPaths["image.url"]).toBeDefined();
    expect(schemaPaths["image.url"].instance).toBe("String");
  });

  test("should have an 'image.filename' field of type String", () => {
    expect(schemaPaths["image.filename"]).toBeDefined();
    expect(schemaPaths["image.filename"].instance).toBe("String");
  });

  test("should have a 'price' field of type Number", () => {
    expect(schemaPaths.price).toBeDefined();
    expect(schemaPaths.price.instance).toBe("Number");
  });

  test("should have a 'location' field of type String", () => {
    expect(schemaPaths.location).toBeDefined();
    expect(schemaPaths.location.instance).toBe("String");
  });

  test("should have a 'country' field of type String", () => {
    expect(schemaPaths.country).toBeDefined();
    expect(schemaPaths.country.instance).toBe("String");
  });

  test("should have 'reviews' as an array of ObjectId refs to 'Review'", () => {
    /**
     * `reviews` is an array of ObjectIds that reference the Review model.
     * This is Mongoose's way of implementing RELATIONSHIPS between documents.
     * Think of it like a foreign key in SQL.
     */
    expect(schemaPaths.reviews).toBeDefined();
    expect(schemaPaths.reviews.instance).toBe("Array");

    // Check the inner type of the array
    const reviewCaster = Listing.schema.path("reviews").caster;
    expect(reviewCaster.instance).toBe("ObjectId");
    expect(reviewCaster.options.ref).toBe("Review");
  });

  test("should have 'owner' as an ObjectId ref to 'User'", () => {
    expect(schemaPaths.owner).toBeDefined();
    expect(schemaPaths.owner.instance).toBe("ObjectId");
    expect(schemaPaths.owner.options.ref).toBe("User");
  });

  test("should have a post-findOneAndDelete hook registered", () => {
    /**
     * The Listing model has a post('findOneAndDelete') hook that
     * cascade-deletes all associated reviews. We verify the hook
     * is registered on the schema.
     *
     * This is a DESIGN PATTERN called "cascade delete" — when
     * a parent (Listing) is deleted, its children (Reviews) are
     * automatically cleaned up.
     *
     * NOTE: Mongoose 7+ stores hooks as a Map, not a plain object.
     */
    const postHooks = Listing.schema.s.hooks._posts;
    const deleteHooks = postHooks.get("findOneAndDelete");
    expect(deleteHooks).toBeDefined();
    expect(deleteHooks.length).toBeGreaterThan(0);
  });
});
