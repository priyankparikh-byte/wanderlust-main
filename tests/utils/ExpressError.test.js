const ExpressError = require("../../utils/ExpressError");

/**
 * =============================================================
 *  ExpressError Unit Tests
 * =============================================================
 *
 *  📖 INSTRUCTOR NOTES:
 *  ---------------------
 *  ExpressError is a CUSTOM ERROR CLASS that extends the built-in
 *  JavaScript `Error`. In Express, when you call `next(err)`, the
 *  error handler middleware picks it up. By adding `statusCode` and
 *  `message`, we can send meaningful HTTP error responses.
 *
 *  These tests verify:
 *  1. The constructor correctly sets both properties
 *  2. It truly inherits from Error (so `instanceof Error` works)
 *  3. Different status codes work as expected
 * =============================================================
 */

describe("ExpressError", () => {

  test("should create an error with statusCode and message", () => {
    // Arrange & Act
    const error = new ExpressError(404, "Page Not Found");

    // Assert
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Page Not Found");
  });

  test("should be an instance of Error", () => {
    /**
     * WHY THIS MATTERS:
     * Express's error-handling middleware catches objects that are
     * instances of Error. If our class doesn't extend Error properly,
     * Express won't handle it correctly.
     */
    const error = new ExpressError(500, "Server Error");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ExpressError);
  });

  test("should work with 400 Bad Request", () => {
    const error = new ExpressError(400, "Bad Request");

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Bad Request");
  });

  test("should work with 500 Internal Server Error", () => {
    const error = new ExpressError(500, "Internal Server Error");

    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Internal Server Error");
  });

  test("should work with 403 Forbidden", () => {
    const error = new ExpressError(403, "Forbidden");

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Forbidden");
  });
});
