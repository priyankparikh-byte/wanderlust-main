const mongoose = require("mongoose");

/**
 * =============================================================
 *  User Model — Schema Shape Tests
 * =============================================================
 *
 *  📖 INSTRUCTOR NOTES:
 *  ---------------------
 *  The User model uses the `passport-local-mongoose` PLUGIN.
 *  Plugins in Mongoose are like EXTENSIONS — they add extra
 *  fields and methods to your schema automatically.
 *
 *  passport-local-mongoose adds:
 *    - `username` field (String, unique)
 *    - `hash` and `salt` fields (for password storage)
 *    - Static methods: authenticate(), serializeUser(), etc.
 *
 *  You only define `email` in your schema — the plugin
 *  handles the rest. These tests verify both your custom
 *  field AND the plugin integration.
 * =============================================================
 */

const User = require("../../models/user");

describe("User Model Schema", () => {
  const schemaPaths = User.schema.paths;

  test("should have an 'email' field of type String", () => {
    expect(schemaPaths.email).toBeDefined();
    expect(schemaPaths.email.instance).toBe("String");
  });

  test("should require the 'email' field", () => {
    expect(schemaPaths.email.isRequired).toBe(true);
  });

  test("should have 'email' marked as unique", () => {
    /**
     * `unique: true` creates a MongoDB unique INDEX.
     * This prevents two users from registering with the same email.
     * Note: `unique` is NOT a validator — it's an index constraint.
     */
    expect(schemaPaths.email._index.unique).toBe(true);
  });

  test("should have 'username' field added by passport-local-mongoose", () => {
    /**
     * passport-local-mongoose automatically adds a 'username' field.
     * This is the field users type in the login form.
     */
    expect(schemaPaths.username).toBeDefined();
    expect(schemaPaths.username.instance).toBe("String");
  });

  test("should have 'hash' field added by passport-local-mongoose", () => {
    /**
     * The 'hash' field stores the PASSWORD HASH.
     * Passwords are NEVER stored as plain text — they are hashed
     * using PBKDF2 by default. Even if the database is compromised,
     * the actual passwords remain secure.
     */
    expect(schemaPaths.hash).toBeDefined();
    expect(schemaPaths.hash.instance).toBe("String");
  });

  test("should have 'salt' field added by passport-local-mongoose", () => {
    /**
     * The 'salt' is a random string mixed into the hash.
     * This prevents two users with the same password from
     * having the same hash (a rainbow table attack defense).
     */
    expect(schemaPaths.salt).toBeDefined();
    expect(schemaPaths.salt.instance).toBe("String");
  });

  test("should have static method 'authenticate' from the plugin", () => {
    /**
     * authenticate() is the method Passport uses during login
     * to verify username + password.
     */
    expect(typeof User.authenticate).toBe("function");
  });

  test("should have static method 'serializeUser' from the plugin", () => {
    expect(typeof User.serializeUser).toBe("function");
  });

  test("should have static method 'deserializeUser' from the plugin", () => {
    expect(typeof User.deserializeUser).toBe("function");
  });

  test("should have static method 'register' from the plugin", () => {
    /**
     * User.register(user, password) is how you create new users.
     * It handles hashing the password and saving the user — you
     * never manually hash passwords yourself.
     */
    expect(typeof User.register).toBe("function");
  });
});
