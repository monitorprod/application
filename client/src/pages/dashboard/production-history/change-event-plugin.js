// eslint-disable-next-line no-unused-vars
/* global Chartist */
import Chartist from "chartist";

((window, document, Chartist) => {
  function hasClass(element, className) {
    return (' ' + element.getAttribute('class') + ' ').indexOf(' ' + className + ' ') > -1;
  }

  Chartist.plugins = Chartist.plugins || {};
  Chartist.plugins.changeEvent = (options) => {
    const changeEvent = (chart) => {
      var $chart = chart.container;
      $chart.addEventListener("click", function (e) {
        if (hasClass(e.target, "ct-bar")) {
          options.onClick && options.onClick(e)
        }
      });
    };
    return changeEvent;
  };
})(window, document, Chartist);
