/**
 * =============================================================
 *  Middleware Unit Tests
 * =============================================================
 *
 *  📖 INSTRUCTOR NOTES:
 *  ---------------------
 *  Middleware functions sit BETWEEN the request and your route
 *  handler. They can:
 *    1. Let the request through  → call next()
 *    2. Block the request        → send a redirect or error
 *    3. Modify req/res           → add data to res.locals
 *
 *  MOCKING STRATEGY:
 *  Since middleware depends on Mongoose models (Listing.findById,
 *  Review.findById), we use jest.mock() to replace the real models
 *  with fake ones. This way, tests run WITHOUT a database.
 *
 *  KEY CONCEPT: jest.mock("../models/listing") tells Jest:
 *  "When anyone requires this module, give them a fake instead."
 *  We then control what the fake returns using mockResolvedValue().
 * =============================================================
 */

// ── Mock the Mongoose models BEFORE requiring middleware ──
// This MUST come before the require("../middleware") call.
jest.mock("../models/listing");
jest.mock("../models/review.js");

const {
  isLoggedIn,
  saveRedirectUrl,
  isOwner,
  validateListing,
  validateReview,
  isReviewAuthor,
} = require("../middleware");
const Listing = require("../models/listing");
const Review = require("../models/review.js");

/**
 * Helper: creates mock Express req, res, next objects.
 * We reuse this across all tests to avoid repetition (DRY principle).
 */
function createMocks() {
  const req = {
    isAuthenticated: jest.fn(),
    session: {},
    originalUrl: "/listings/123",
    flash: jest.fn(),
    params: {},
    body: {},
    user: { _id: "user123" },
  };

  const res = {
    redirect: jest.fn(),
    locals: {
      currentUser: { _id: "user123" },
    },
  };

  const next = jest.fn();

  return { req, res, next };
}

// ═══════════════════════════════════════════════════════════════
//  isLoggedIn
// ═══════════════════════════════════════════════════════════════
describe("isLoggedIn", () => {

  test("should call next() when user is authenticated", () => {
    const { req, res, next } = createMocks();
    req.isAuthenticated.mockReturnValue(true);

    isLoggedIn(req, res, next);

    /**
     * If the user IS logged in, the middleware should just
     * call next() — passing control to the route handler.
     */
    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should redirect to /login when user is NOT authenticated", () => {
    const { req, res, next } = createMocks();
    req.isAuthenticated.mockReturnValue(false);

    isLoggedIn(req, res, next);

    /**
     * Unauthenticated users should be:
     * 1. Redirected to /login
     * 2. Shown a flash error message
     * 3. Have their intended URL saved (so we redirect back after login)
     */
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(req.flash).toHaveBeenCalledWith("error", "You must be signed in first!");
    expect(req.session.redirectUrl).toBe("/listings/123");
    expect(next).not.toHaveBeenCalled();
  });

  test("should save the original URL in session for redirect after login", () => {
    const { req, res, next } = createMocks();
    req.isAuthenticated.mockReturnValue(false);
    req.originalUrl = "/listings/456/edit";

    isLoggedIn(req, res, next);

    expect(req.session.redirectUrl).toBe("/listings/456/edit");
  });
});


// ═══════════════════════════════════════════════════════════════
//  saveRedirectUrl
// ═══════════════════════════════════════════════════════════════
describe("saveRedirectUrl", () => {

  test("should copy session.redirectUrl to res.locals", () => {
    const { req, res, next } = createMocks();
    req.session.redirectUrl = "/listings/789";

    saveRedirectUrl(req, res, next);

    /**
     * res.locals is available inside EJS templates and
     * subsequent middleware. By copying the URL here,
     * the login controller can access it via res.locals.redirectUrl.
     */
    expect(res.locals.redirectUrl).toBe("/listings/789");
    expect(next).toHaveBeenCalled();
  });

  test("should call next() even when no redirectUrl exists", () => {
    const { req, res, next } = createMocks();
    // No redirectUrl in session — should not crash

    saveRedirectUrl(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});


// ═══════════════════════════════════════════════════════════════
//  validateListing
// ═══════════════════════════════════════════════════════════════
describe("validateListing", () => {

  test("should call next() when listing data is valid", () => {
    const { req, res, next } = createMocks();
    req.body = {
      listing: {
        title: "Nice Place",
        description: "A lovely spot",
        price: 1000,
        location: "Mumbai",
        country: "India",
      },
    };

    validateListing(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("should throw ExpressError(400) when listing data is invalid", () => {
    const { req, res, next } = createMocks();
    req.body = { listing: { title: "" } }; // Missing required fields

    /**
     * validateListing uses `throw new ExpressError(400, msg)`.
     * In Jest, we wrap it in expect(...).toThrow() to catch the error.
     */
    expect(() => validateListing(req, res, next)).toThrow();
  });
});


// ═══════════════════════════════════════════════════════════════
//  validateReview
// ═══════════════════════════════════════════════════════════════
describe("validateReview", () => {

  test("should call next() when review data is valid", () => {
    const { req, res, next } = createMocks();
    req.body = {
      review: {
        rating: 4,
        comment: "Wonderful stay!",
      },
    };

    validateReview(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("should throw ExpressError(400) when review data is invalid", () => {
    const { req, res, next } = createMocks();
    req.body = { review: { rating: 10 } }; // Rating > 5, no comment

    expect(() => validateReview(req, res, next)).toThrow();
  });
});


// ═══════════════════════════════════════════════════════════════
//  isOwner
// ═══════════════════════════════════════════════════════════════
describe("isOwner", () => {

  test("should call next() when the current user IS the owner", async () => {
    const { req, res, next } = createMocks();
    req.params.id = "listing123";

    /**
     * We mock Listing.findById to return a fake listing
     * whose owner._id.equals() returns true.
     *
     * KEY CONCEPT: `equals()` is a Mongoose ObjectId method.
     * Since we're not using real ObjectIds, we mock it too.
     */
    Listing.findById.mockResolvedValue({
      owner: {
        _id: {
          equals: jest.fn().mockReturnValue(true),
        },
      },
    });

    await isOwner(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should redirect when the current user is NOT the owner", async () => {
    const { req, res, next } = createMocks();
    req.params.id = "listing123";

    Listing.findById.mockResolvedValue({
      owner: {
        _id: {
          equals: jest.fn().mockReturnValue(false), // Not the owner!
        },
      },
    });

    await isOwner(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "You do not have permission to do that!"
    );
    expect(res.redirect).toHaveBeenCalledWith("/listings/listing123");
    expect(next).not.toHaveBeenCalled();
  });
});


// ═══════════════════════════════════════════════════════════════
//  isReviewAuthor
// ═══════════════════════════════════════════════════════════════
describe("isReviewAuthor", () => {

  test("should call next() when the current user IS the review author", async () => {
    const { req, res, next } = createMocks();
    req.params = { id: "listing123", reviewId: "review456" };

    Review.findById.mockResolvedValue({
      author: {
        _id: {
          equals: jest.fn().mockReturnValue(true),
        },
      },
    });

    await isReviewAuthor(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  test("should redirect when the current user is NOT the review author", async () => {
    const { req, res, next } = createMocks();
    req.params = { id: "listing123", reviewId: "review456" };

    Review.findById.mockResolvedValue({
      author: {
        _id: {
          equals: jest.fn().mockReturnValue(false),
        },
      },
    });

    await isReviewAuthor(req, res, next);

    expect(req.flash).toHaveBeenCalledWith(
      "error",
      "You do not have permission to do that!"
    );
    expect(res.redirect).toHaveBeenCalledWith("/listings/listing123");
    expect(next).not.toHaveBeenCalled();
  });
});
