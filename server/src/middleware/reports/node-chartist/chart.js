const capitalize = require("underscore.string/capitalize");
const co = require("co");
const renderAxisTitles = require("./axis-title");

/**
 * Generate Chart HTML
 * @param  {String} type
 *         bar, line, pie
 * @return {Promise{String}} html
 */
const generate = co.wrap(function*(Chartist, window, type, options, data) {
  type = capitalize(type);
  if (!Chartist[type]) throw new TypeError(`Unsupported chart type: ${type}`);
  const container = window.document.createElement("div");
  const chart = new Chartist[type](container, data, options);
  if (options.listeners) {
    Object.keys(options.listeners).forEach(key => {
      const eventListener = options.listeners[key];
      // Listening for draw events that get emitted by the Chartist chart
      chart.on(key, eventListener);
    });
  }
  const event = yield new Promise(resolve => chart.on("created", resolve));
  chart.axisX = event.axisX;
  chart.axisY = event.axisY;
  renderAxisTitles(Chartist, chart);
  chart.detach();
  // chart.off("draw", options.listener);
  return container.innerHTML;
});

module.exports = generate;
