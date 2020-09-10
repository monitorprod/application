import React from "react";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import { Grid, Typography } from "@material-ui/core";
import { withStyles, lodashGet, NUMBER_FORMAT } from "../../../utils";

const styles = (theme) => ({
  container: {
    display: "flex",
    // TODO use css instead of prop on GRID
    alignItems: "center",
  },
  title: {
    width: 220,
  },
});

const BarChart = ({ classes, theme, text, data }) => {
  const chartistOptions = {
    height: 50,
    reverseData: true,
    horizontalBars: true,
    axisX: {
      offset: 20,
      type: Chartist.FixedScaleAxis,
      high: 110,
      low: 0,
      ticks: [0, 50, 100],
      // TODO find and replace all `+ "`
      labelInterpolationFnc: (value) => `${value}%`,
    },
    axisY: {
      showGrid: false,
      showLabel: false,
    },
  };
  const fillBarColor = {
    draw: (context) => {
      if (context.series) {
        context.element.attr({
          style: `stroke: ${lodashGet(
            context,
            "series.0.bgColor"
          )}; stroke-width: ${
            window.outerWidth <= theme.breakpoints.width("sm") ? "15px" : "30px"
          }`,
        });
      }
      if (context.type === "grid") {
        context.element.attr({
          y1: context.y1 - 15,
          y2: context.y2 + 15,
          style: "stroke: black; stroke-width: 1px; stroke-dasharray: none;",
        });
      }
    },
  };
  return (
    <Grid item container spacing={0} className={classes.container}>
      <Grid item className={classes.title}>
        <Typography variant="body1">
          {text}{" "}
          {NUMBER_FORMAT(
            parseFloat(lodashGet(data, "series.0.0.value")).toFixed(2)
          )}
          %
        </Typography>
      </Grid>
      <Grid item>
        <ChartistGraph
          type="Bar"
          className="ct-oee-indicators"
          data={data}
          options={chartistOptions}
          listener={fillBarColor}
          style={{ padding: theme.spacing(2) }}
        />
      </Grid>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(BarChart);
