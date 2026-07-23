const wrapAsync = require("../../utils/wrapAsync");

/**
 * =============================================================
 *  wrapAsync Unit Tests
 * =============================================================
 *
 *  📖 INSTRUCTOR NOTES:
 *  ---------------------
 *  `wrapAsync` is a HIGHER-ORDER FUNCTION — it takes a function
 *  and returns a NEW function. Its job is simple but critical:
 *
 *    ┌─────────────────────────────────────────────────────────┐
 *    │  async route handler throws?  →  catch it  →  call next(err)  │
 *    └─────────────────────────────────────────────────────────┘
 *
 *  WITHOUT wrapAsync, every async route would need its own
 *  try/catch block. This DRYs up error handling.
 *
 *  KEY CONCEPT: We use `jest.fn()` to create MOCK functions.
 *  A mock is a fake function that records how it was called,
 *  so we can assert things like "was next() called with an error?"
 * =============================================================
 */

describe("wrapAsync", () => {
  // These are our mock Express objects — fake req, res, next
  let req, res, next;

  beforeEach(() => {
    /**
     * beforeEach runs before EVERY test.
     * We reset our mocks so each test starts fresh.
     * This prevents test pollution (one test affecting another).
     */
    req = {};
    res = {};
    next = jest.fn(); // jest.fn() creates a spy — a function that tracks calls
  });

  test("should call the wrapped function with req, res, next", async () => {
    // Arrange: create a mock async function
    const mockFn = jest.fn().mockResolvedValue(undefined);
    // mockResolvedValue makes it return a resolved Promise

    // Act: wrap it and call the result
    const wrapped = wrapAsync(mockFn);
    await wrapped(req, res, next);

    // Assert: our original function received the Express args
    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test("should call next(err) when the async function rejects", async () => {
    /**
     * THIS IS THE CORE PURPOSE OF wrapAsync.
     * If the async handler throws/rejects, the error must be
     * forwarded to Express's error handler via next(err).
     */
    const testError = new Error("Something broke!");
    const failingFn = jest.fn().mockRejectedValue(testError);

    const wrapped = wrapAsync(failingFn);
    await wrapped(req, res, next);

    // next should have been called with the error
    expect(next).toHaveBeenCalledWith(testError);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should NOT call next when the async function resolves", async () => {
    /**
     * On the happy path, the route handler does its work and
     * sends a response. `next` should NOT be called — calling
     * next() without an error would skip to the next middleware,
     * which is not what we want.
     */
    const successFn = jest.fn().mockResolvedValue("success");

    const wrapped = wrapAsync(successFn);
    await wrapped(req, res, next);

    // next should NOT have been called
    expect(next).not.toHaveBeenCalled();
  });

  test("should return a function (middleware signature)", () => {
    /**
     * Express middleware must be a function with (req, res, next).
     * wrapAsync must return a function — not call the original immediately.
     */
    const mockFn = jest.fn();
    const wrapped = wrapAsync(mockFn);

    expect(typeof wrapped).toBe("function");
    // The original should not be called yet
    expect(mockFn).not.toHaveBeenCalled();
  });
});
