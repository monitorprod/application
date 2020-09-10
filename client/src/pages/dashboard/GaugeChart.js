import React from "react";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import { withStyles } from "../../utils";
import "./target-line-plugin";

const styles = theme => ({});

const GaugeChart = ({ classes, theme, value }) => {
  const chartistGaugeData = [
    { value: 50, offset: 50, bgColor: "#FDBFC3" },
    { value: 30, offset: 80, bgColor: "#FFFFBF" },
    { value: 20, offset: 100, bgColor: "#DEEEE3" }
  ];
  const chartistGaugeOptions = {
    height: 300,
    startAngle: 270,
    total: 200,
    showLabel: false,
    plugins: [
      Chartist.plugins.targetLine({
        value,
        color: "#000"
        // color: lodashGet(lodashFind(chartistGaugeData, data => 37.8 <= data.offset), "bgColor"),
      })
    ]
  };
  const fillPieColor = {
    draw: context => {
      if (context.series) {
        context.element.attr({
          style: `fill: ${context.series.bgColor};`
        });
      }
    }
  };
  return (
    <ChartistGraph
      type="Pie"
      data={{
        series: chartistGaugeData
      }}
      options={chartistGaugeOptions}
      listener={fillPieColor}
      style={{ padding: theme.spacing(2), marginTop: 50 }}
    />
  );
};

export default withStyles(styles, { withTheme: true })(GaugeChart);
