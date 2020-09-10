const assert = require("assert");
const app = require("../../src/app");

describe("'simple_accounts' service", () => {
  it("registered the service", () => {
    const service = app.service("simple-accounts");

    assert.ok(service, "Registered the service");
  });
});
