const { describe, test } = require("node:test");
const assert = require("node:assert");
const { validateRegister, validateLogin } = require("../src/middleware/validateInput");

// Helper to mock Express req/res/next
const mockReqResNext = (body) => {
  const req = { body };
  let statusCode = null;
  let jsonResponse = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      jsonResponse = payload;
      return this;
    },
  };

  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return {
    req,
    res,
    next,
    getStatusCode: () => statusCode,
    getJsonResponse: () => jsonResponse,
    wasNextCalled: () => nextCalled,
  };
};

describe("Input Validation Middleware — Registration", () => {
  test("Should pass validation with valid registration details", () => {
    const ctx = mockReqResNext({
      name: "Alex Mercer",
      email: "alex@sentinelops.io",
      password: "StrongPassword123",
    });

    validateRegister(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), true);
    assert.strictEqual(ctx.getStatusCode(), null);
  });

  test("Should reject missing or short name (<2 chars)", () => {
    const ctx = mockReqResNext({
      name: "A",
      email: "alex@sentinelops.io",
      password: "StrongPassword123",
    });

    validateRegister(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), false);
    assert.strictEqual(ctx.getStatusCode(), 400);
    assert.ok(ctx.getJsonResponse().errors.length > 0);
  });

  test("Should reject invalid email format", () => {
    const ctx = mockReqResNext({
      name: "Alex Mercer",
      email: "invalid-email-address",
      password: "StrongPassword123",
    });

    validateRegister(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), false);
    assert.strictEqual(ctx.getStatusCode(), 400);
  });

  test("Should reject password shorter than 8 chars", () => {
    const ctx = mockReqResNext({
      name: "Alex Mercer",
      email: "alex@sentinelops.io",
      password: "Short1",
    });

    validateRegister(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), false);
    assert.strictEqual(ctx.getStatusCode(), 400);
  });

  test("Should reject password missing uppercase character", () => {
    const ctx = mockReqResNext({
      name: "Alex Mercer",
      email: "alex@sentinelops.io",
      password: "nouppercasepassword123",
    });

    validateRegister(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), false);
    assert.strictEqual(ctx.getStatusCode(), 400);
  });

  test("Should reject password missing digits", () => {
    const ctx = mockReqResNext({
      name: "Alex Mercer",
      email: "alex@sentinelops.io",
      password: "NoDigitsPasswordHere",
    });

    validateRegister(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), false);
    assert.strictEqual(ctx.getStatusCode(), 400);
  });

  test("Should sanitize and lowercase email and trim name", () => {
    const ctx = mockReqResNext({
      name: "   Alex Mercer   ",
      email: "   ALEX@SENTINELOPS.IO   ",
      password: "StrongPassword123",
    });

    validateRegister(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), true);
    assert.strictEqual(ctx.req.body.name, "Alex Mercer");
    assert.strictEqual(ctx.req.body.email, "alex@sentinelops.io");
  });
});

describe("Input Validation Middleware — Login", () => {
  test("Should pass validation with valid login details", () => {
    const ctx = mockReqResNext({
      email: "alex@sentinelops.io",
      password: "SomePassword",
    });

    validateLogin(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), true);
  });

  test("Should reject login with missing email", () => {
    const ctx = mockReqResNext({
      password: "SomePassword",
    });

    validateLogin(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), false);
    assert.strictEqual(ctx.getStatusCode(), 400);
  });

  test("Should reject login with missing password", () => {
    const ctx = mockReqResNext({
      email: "alex@sentinelops.io",
    });

    validateLogin(ctx.req, ctx.res, ctx.next);
    assert.strictEqual(ctx.wasNextCalled(), false);
    assert.strictEqual(ctx.getStatusCode(), 400);
  });
});

