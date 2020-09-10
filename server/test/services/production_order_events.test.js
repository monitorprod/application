const assert = require('assert');
const app = require('../../src/app');

describe('\'production_order_events\' service', () => {
  it('registered the service', () => {
    const service = app.service('production-order-events');

    assert.ok(service, 'Registered the service');
  });
});
