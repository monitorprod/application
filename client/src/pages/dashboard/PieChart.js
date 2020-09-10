import React from "react";
import ChartistGraph from "react-chartist";
import { Paper } from "@material-ui/core";
import { withStyles, lodashGet } from "../../utils";
import { lodashMap } from "../../utils/lodash";

const styles = theme => ({
  legend: {
    fontSize: "small",
    [theme.breakpoints.down("sm")]: {
      fontSize: "xx-small"
    },
    flexWrap: "wrap",
    display: "flex",
    margin: `0 ${theme.spacing9}px`,
    boxShadow: "none",
    background: "none"
  },
  titleLegend: {
    margin: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(1 / 2)
    },
    display: "flex",
    width: "fit-content",
    alignItems: "center"
  },
  iconLegend: {
    borderRadius: "50%",
    height: 10,
    width: 10,
    margin: 5
  }
});

const PieChart = ({ classes, theme, options = {}, data }) => {
  const chartistOptions = {
    chartPadding: 30,
    labelOffset: 70,
    height: 300,
    showLabel: false,
    labelDirection: "explode",
    labelInterpolationFnc: value => `${value}%`,
    ...options
  };
  const fillSectorColor = {
    draw: context => {
      if (context.series || context.type === "label") {
        const nodes = Array.prototype.slice.call(
          lodashGet(context, "element._node.parentElement.children") || []
        );
        const index = nodes.indexOf(lodashGet(context, "element._node"));
        context.element.attr({
          style: `fill: ${lodashGet(context, "series.bgColor") ||
            lodashGet(data, `series.${index}.bgColor`)}`
        });
      }
    }
  };
  return (
    <React.Fragment>
      <ChartistGraph
        type="Pie"
        data={data}
        options={chartistOptions}
        listener={fillSectorColor}
        style={{ padding: theme.spacing(2) }}
      />
      <Paper className={classes.legend}>
        {lodashMap(data.labelsNames, (legend, index) => (
          <div key={index} className={classes.titleLegend}>
            <i
              className={classes.iconLegend}
              style={{
                background: lodashGet(data, `series.${index}.bgColor`)
              }}
            />{" "}
            {legend}
          </div>
        ))}
      </Paper>
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(PieChart);
