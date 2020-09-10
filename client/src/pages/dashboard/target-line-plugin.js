/**
 * Chartist.js plugin to display a target line on a chart.
 * With code from @gionkunz in https://github.com/gionkunz/chartist-js/issues/235
 * and @OscarGodson in https://github.com/gionkunz/chartist-js/issues/491.
 * and @EmersonBottero in https://github.com/gionkunz/chartist-js/issues/235
 * Based on https://github.com/gionkunz/chartist-plugin-pointlabels
 */

// eslint-disable-next-line no-unused-vars
/* global Chartist */
import Chartist from "chartist";
import { NUMBER_FORMAT } from "../../utils";

((window, document, Chartist) => {
  Chartist.plugins = Chartist.plugins || {};
  Chartist.plugins.targetLine = (options) => {
    const targetLine = (chart) => {
      chart.on("created", (context) => {
        options.class = "ct-target-line";
        if (context.axisX && context.options.horizontalBars) {
          const targetLineX =
            context.chartRect.x1 + context.axisX.projectValue(options.value);
          context.svg.elem(
            "line",
            {
              x1: targetLineX,
              x2: targetLineX,
              y1: context.chartRect.y1,
              y2: context.chartRect.y2,
            },
            options.class
          );
        } else if (context.axisX && !context.options.horizontalBars) {
          const targetLineY =
            context.chartRect.y1 - context.axisY.projectValue(options.value);
          context.svg.elem(
            "line",
            {
              x1: context.chartRect.x1,
              x2: context.chartRect.x2,
              y1: targetLineY,
              y2: targetLineY,
            },
            options.class
          );
        } else {
          options.class = "ct-gauge-needle";
          const centerX = (context.chartRect.x1 + context.chartRect.x2) / 2;
          const centerY = (context.chartRect.y1 + context.chartRect.y2) / 2;
          const needleLength = 150;
          const needleRadius = 5;
          const percentToDegree = (p) => p * 360;
          const degreeToRadian = (d) => (d * Math.PI) / 180;
          const percentToRadian = (p) => degreeToRadian(percentToDegree(p));
          // TODO this is hardcoded, consider the arc and length on options
          // const relativePercentage =
          //   Math.round(
          //     ((parseFloat(options.value) * (116.66666 - -16.66666)) / 100 + -16.66666) * 10
          //   ) / 10;
          const relativePercentage = parseFloat(options.value);
          const thetaRad = percentToRadian(
            (relativePercentage > 105 ? 105 : relativePercentage) / 100 / 2
          );
          const topX = centerX - needleLength * Math.cos(thetaRad);
          const topY = centerY - needleLength * Math.sin(thetaRad);
          const leftX =
            centerX - needleRadius * Math.cos(thetaRad - Math.PI / 2);
          const leftY =
            centerY - needleRadius * Math.sin(thetaRad - Math.PI / 2);
          const rightX =
            centerX - needleRadius * Math.cos(thetaRad + Math.PI / 2);
          const rightY =
            centerY - needleRadius * Math.sin(thetaRad + Math.PI / 2);
          context.svg.elem(
            "circle",
            {
              cx: centerX,
              cy: centerY,
              r: needleRadius,
            },
            options.class
          );
          context.svg.elem(
            "path",
            {
              d: `M ${leftX} ${leftY} L ${topX} ${topY} L ${rightX} ${rightY}`,
            },
            options.class
          );
          const text = context.svg.elem(
            "text",
            {
              x: topX,
              y: topY - 20,
              style: `fill:${options.color};stroke:${options.color};`,
            },
            options.class
          );
          text._node.innerHTML = `${NUMBER_FORMAT(
            parseFloat(options.value).toFixed(2)
          )}%`;
        }
      });
    };
    return targetLine;
  };
})(window, document, Chartist);
