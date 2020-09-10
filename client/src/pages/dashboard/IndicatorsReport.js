import React, { useContext, useState, useEffect } from "react";
import moment from "moment";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import "chartist-plugin-tooltips";
import "./chartist-plugin-tooltip.css";
import "chartist/dist/chartist.css";
import { Paper, Grid, Typography, Icon } from "@material-ui/core";
import ApiContext from "../../api";
import {
  Link,
  withStyles,
  lodashGet,
  lodashMap,
  getEventType,
  getColor,
  NUMBER_FORMAT,
} from "../../utils";
import { Loader } from "../../components";
import "./reports.css";
import GaugeChart from "./GaugeChart";
import PieChart from "./PieChart";
import useAuth from "../../utils/useAuth";

const styles = (theme) => ({
  item: {
    "& canvas": {
      paddingLeft: theme.spacing(3),
      [theme.breakpoints.up("sm")]: {
        height: "280px !important",
      },
    },
  },
  header: {
    padding: theme.spacing(2),
  },
  title: {
    color:
      theme.palette.type === "dark"
        ? theme.palette.common.white
        : theme.palette.common.black,
    display: "flex",
    alignItems: "center",
    fontSize: "1.5rem",
    textDecoration: "none",
  },
  wrapper: {
    display: "flex",
    position: "relative",
    paddingLeft: theme.spacing(3),
    alignItems: "center",
  },
  linkIcon: {
    marginLeft: theme.spacing(1),
  },
  icon: {
    fontSize: 50,
    color:
      theme.palette.type === "dark"
        ? theme.palette.common.white
        : theme.palette.primary.main,
  },
  legend: {
    flexWrap: "wrap",
    display: "flex",
    margin: `${theme.spacing(2)}px ${theme.spacing(2)}px 0`,
    boxShadow: "none",
    background: "none",
    fontSize: "small",
    [theme.breakpoints.down("sm")]: {
      fontSize: "xx-small",
    },
  },
  titleLegend: {
    display: "flex",
    width: "fit-content",
    alignItems: "center",
    textTransform: "uppercase",
    margin: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(1 / 2),
    },
  },
  iconLegend: {
    borderRadius: "50%",
    height: 10,
    width: 10,
    margin: 5,
  },
  kpiLabel: {
    fontSize: ".75rem",
  },
  kpi: {
    fontSize: "1.5rem",
    position: "absolute",
    right: 30,
    bottom: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      position: "static",
      flexDirection: "row",
      fontSize: "1rem",
      "& > span:first-of-type": {
        order: 1,
        marginLeft: theme.spacing(1),
      },
    },
  },
});

const IndicatorsReport = ({ classes, theme, plantIdQuery = {} }) => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  const client = useContext(ApiContext);
  const [loading, setLoading] = useState();
  const [weekLoading, setWeekLoading] = useState();
  const stringQuery = JSON.stringify(plantIdQuery);
  useEffect(() => {
    // console.log("!!effect getReportIndicatorsData");
    const getYesterdaySummaryData = async () => {
      setLoading(true);
      const YesterdaySummaryData = await client.service("machines").find({
        query: {
          ...JSON.parse(stringQuery),
          $reportYesterdaySummary: {
            sd: moment().subtract(1, "days").startOf("day").add(6, "hours"),
            ed: moment().subtract(1, "days").endOf("day").add(6, "hours"),
          },
          machineStatusId: lodashGet(
            client.get("config.machine.status.active"),
            "value"
          ),
        },
      });
      setOEEData(YesterdaySummaryData.graphOEE);
      setInactivityData(YesterdaySummaryData.graphInactivity);
      setStatsData(YesterdaySummaryData.graphStats);
      setLoading(false);
    };
    getYesterdaySummaryData();
  }, [client, stringQuery]);
  useEffect(() => {
    // console.log("!!effect getReportIndicatorsData");
    const getReportIndicatorsData = async () => {
      setWeekLoading(true);
      const ReportIndicatorsData = await client.service("machines").find({
        query: {
          ...JSON.parse(stringQuery),
          $reportIndicators: {
            sd: moment().subtract(3, "days").startOf("day").add(6, "hours"),
            ed: moment().subtract(1, "days").endOf("day").add(6, "hours"),
            dates: [
              {
                sd: moment().subtract(7, "days").startOf("day").add(6, "hours"),
                ed: moment().subtract(7, "days").endOf("day").add(6, "hours"),
              },
              {
                sd: moment().subtract(6, "days").startOf("day").add(6, "hours"),
                ed: moment().subtract(6, "days").endOf("day").add(6, "hours"),
              },
              {
                sd: moment().subtract(5, "days").startOf("day").add(6, "hours"),
                ed: moment().subtract(5, "days").endOf("day").add(6, "hours"),
              },
              {
                sd: moment().subtract(4, "days").startOf("day").add(6, "hours"),
                ed: moment().subtract(4, "days").endOf("day").add(6, "hours"),
              },
              {
                sd: moment().subtract(3, "days").startOf("day").add(6, "hours"),
                ed: moment().subtract(3, "days").endOf("day").add(6, "hours"),
              },
              {
                sd: moment().subtract(2, "days").startOf("day").add(6, "hours"),
                ed: moment().subtract(2, "days").endOf("day").add(6, "hours"),
              },
              {
                sd: moment().subtract(1, "days").startOf("day").add(6, "hours"),
                ed: moment().subtract(1, "days").endOf("day").add(6, "hours"),
              },
            ],
          },
          machineStatusId: lodashGet(
            client.get("config.machine.status.active"),
            "value"
          ),
        },
      });
      const data = ReportIndicatorsData.graphIndicators;
      data.series = data.series.slice(0, 3);
      setWeekReportData(data);
      setWeekLoading(false);
    };
    getReportIndicatorsData();
  }, [client, stringQuery]);
  //#region Chartist
  const [oeeData, setOEEData] = useState();
  const [weekReportData, setWeekReportData] = useState({});
  const [inactivityData, setInactivityData] = useState({});
  const [statsData, setStatsData] = useState({});
  const weekReportOptions = {
    height: 250,
    axisX: {
      showGrid: false,
    },
    axisY: {
      offset: 20,
      type: Chartist.FixedScaleAxis,
      high: 110,
      low: 0,
      ticks: [0, 20, 40, 60, 80, 100],
      labelInterpolationFnc: (value) => `${value}%`,
    },
    plugins: [
      Chartist.plugins.tooltip({
        appendToBody: true,
        class: "gauge-tooltip",
        tooltipFnc: (meta, value) =>
          NUMBER_FORMAT(parseFloat(value).toFixed(2)),
      }),
    ],
  };
  const fillBarColor = {
    draw: (context) => {
      if (context.series) {
        context.element.attr({
          style: `stroke: ${context.series.bgColor}; stroke-width: ${
            window.outerWidth <= theme.breakpoints.width("sm") ? "15px" : "30px"
          }`,
        });
      }
    },
  };
  //#endregion
  const noJustifiedEventType = getEventType({ client, type: "noJustified" });
  const noJustifiedColor = getColor({
    data: client.get(`actionType.${noJustifiedEventType}`),
    path: "color",
  });
  const [startDate] = useState(
    moment().subtract(7, "day").startOf("day").add(6, "hours")
  );
  const [endDate] = useState(
    moment().subtract(1, "day").endOf("day").add(6, "hours")
  );
  return (
    <React.Fragment>
      <Grid
        item
        xs={12}
        sm={6}
        className={classes.item}
        component={Link}
        to={"/reports/production-oee"}
      >
        <div className={classes.wrapper}>
          <Icon className={classes.icon}>donut_large</Icon>
          <div className={classes.header}>
            <Typography className={classes.title} variant="body1">
              <span>OEE (ontem)</span>
              <Icon className={classes.linkIcon}>arrow_forward_ios</Icon>
            </Typography>
            {level !== "N1" && (
              <div className={classes.kpi}>
                <span
                  className={classes.kpiLabel}
                  style={{
                    color: noJustifiedColor,
                  }}
                >
                  Qualidade assumida 100%
                </span>
              </div>
            )}
          </div>
        </div>
        {loading && <Loader />}
        {!loading && <GaugeChart value={oeeData} />}
      </Grid>
      <Grid
        item
        xs={12}
        sm={6}
        className={classes.item}
        component={Link}
        to={`/reports/production-oee?sd=${startDate.toISOString()}&ed=${endDate.toISOString()}`}
      >
        <div className={classes.wrapper}>
          <Icon className={classes.icon}>view_week</Icon>
          <div className={classes.header}>
            <Typography className={classes.title} variant="body1">
              <span>Indicadores (7 dias)</span>
              <Icon className={classes.linkIcon}>arrow_forward_ios</Icon>
            </Typography>
          </div>
        </div>
        {weekLoading && <Loader />}
        {!weekLoading && (
          <React.Fragment>
            <ChartistGraph
              type="Bar"
              className="ct-indicators"
              data={weekReportData}
              options={weekReportOptions}
              listener={fillBarColor}
              style={{ padding: theme.spacing(2) }}
            />
            <Paper className={classes.legend}>
              {lodashMap(
                ["Disponibilidade", "Qualidade", "Performance"],
                (legend, index) => (
                  <div key={index} className={classes.titleLegend}>
                    <i
                      className={classes.iconLegend}
                      style={{
                        background: lodashGet(
                          weekReportData,
                          `series.${index}.bgColor`
                        ),
                      }}
                    />{" "}
                    {legend}
                  </div>
                )
              )}
            </Paper>
          </React.Fragment>
        )}
      </Grid>
      <Grid item xs={12} sm={6} className={classes.item}>
        <div className={classes.wrapper}>
          <Icon className={classes.icon}>pie_chart</Icon>
          <div className={classes.header}>
            <Typography className={classes.title} variant="body1">
              Disponibilidade (ontem)
            </Typography>
            <div className={classes.kpi}>
              {loading && <Loader />}
              {!loading && (
                <span
                  style={{
                    color: noJustifiedColor,
                  }}
                >
                  {NUMBER_FORMAT(
                    parseFloat(
                      statsData.graphTotalNonPlannedStoppedTime
                    ).toFixed(2)
                  )}
                </span>
              )}
              <span
                className={classes.kpiLabel}
                style={{
                  color: noJustifiedColor,
                }}
              >
                Horas paradas
              </span>
            </div>
          </div>
        </div>
        {loading && <Loader />}
        {!loading && <PieChart data={inactivityData} />}
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(IndicatorsReport);
