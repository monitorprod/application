const assert = require("assert");
const app = require("../../src/app");

describe("'simple_accounts_status' service", () => {
  it("registered the service", () => {
    const service = app.service("simple-accounts-status");

    assert.ok(service, "Registered the service");
  });
});
