const assert = require("assert");
const app = require("../../src/app");

describe("'simple_account_roles' service", () => {
  it("registered the service", () => {
    const service = app.service("simple-account-roles");

    assert.ok(service, "Registered the service");
  });
});
