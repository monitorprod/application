import React, { useContext, useState, useEffect, useCallback } from "react";
import moment from "moment";
import NumberFormat from "react-number-format";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import "chartist-plugin-tooltips";
import "../chartist-plugin-tooltip.css";
import "chartist/dist/chartist.css";
import {
  Paper,
  Grid,
  Typography,
  Toolbar,
  Hidden,
  Icon,
} from "@material-ui/core";
import { useDebouncedCallback } from "use-debounce";
import ApiContext from "../../../api";
import {
  Link,
  withRouter,
  classNames,
  withStyles,
  lodashGet,
  lodashMap,
  lodashForEach,
  NUMBER_FORMAT,
} from "../../../utils";
import { Loader, Tree } from "../../../components";
import "../reports.css";
import DateFilter from "../DateFilter";
import GaugeChart from "../GaugeChart";
import PieChart from "../PieChart";
import BarChart from "./BarChart";
import PlantMachinesList from "./PlantMachinesList";
import { MachinesModel } from "../../master-data/models";

const styles = (theme) => ({
  container: {
    height: "100%",
    flexWrap: "nowrap",
    overflow: "visible",
  },
  wrapper: {
    height: "100%",
    overflow: "hidden",
  },
  toolbar: {
    zIndex: 10,
    width: `calc(100% + ${theme.spacing(6)}px)`,
    margin: -theme.spacing(3),
    marginBottom: theme.spacing(2),
    color: theme.palette.common.black,
    backgroundColor: theme.palette.secondary.main,
    [theme.breakpoints.down("xs")]: {
      margin: -theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: `calc(100% + ${theme.spacing(2)}px)`,
    },
  },
  toolbarTitle: {
    fontSize: "1rem",
  },
  // TODO use meaningful names for classes, not just generic
  toolbarLabel: {
    padding: `0 ${theme.spacing(1)}px`,
    fontSize: "1rem",
  },
  tree: {
    flex: 1,
    height: "100%",
    maxWidth: "25%",
    overflowY: "auto",
    overflowX: "hidden",
  },
  treeItemSelected: {
    backgroundColor: theme.palette.primary.form,
  },
  content: {
    height: "100%",
    position: "relative",
    overflow: "auto",
    flex: 1,
  },
  graphWrapper: {
    display: "flex",
    paddingLeft: theme.spacing(3),
    alignItems: "center",
  },
  graphSidebar: {
    flexDirection: "column",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "row",
    },
  },
  graphItem: {
    "& canvas": {
      paddingLeft: theme.spacing(3),
      [theme.breakpoints.up("sm")]: {
        height: "280px !important",
      },
    },
  },
  graphItemDetail: {
    padding: theme.spacing(1),
  },
  graphTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: "1.5rem",
    padding: theme.spacing(2),
    textDecoration: "none",
  },
  graphSidebarTitle: {
    fontSize: ".9rem",
  },
  graphIcon: {
    fontSize: 50,
    color: theme.palette.primary.main,
  },
  graphDetailTitle: {
    textAlign: "right",
    fontSize: ".9rem",
  },
  graphDetail: {
    fontWeight: "bold",
  },
  allPlants: {
    color: theme.palette.common.black,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
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
});

const ProductionOEE = ({
  classes,
  theme,
  match: { params },
  location: { pathname },
  timeCarousel,
}) => {
  const client = useContext(ApiContext);
  const [availabilityData, setAvailabilityData] = useState({});
  const [graphOEEData, setGraphOEEData] = useState({});
  const [qualityData, setQualityData] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [oeeData, setOEEData] = useState();
  const [actionsData, setActionsData] = useState({});
  const [statsData, setStatsData] = useState({});
  const [loading, setLoading] = useState();
  const [loadingGraph, setLoadingGraph] = useState();
  const [startDate, setStartDate] = useState(
    moment().subtract(1, "days").startOf("day").add(6, "hours")
  );
  const [endDate, setEndDate] = useState(
    moment().subtract(1, "days").endOf("day").add(6, "hours")
  );
  const stringStartDate = startDate.toISOString();
  const stringEndDate = endDate.toISOString();
  const [getReportOEEData] = useDebouncedCallback(
    useCallback(() => {
      const asyncGetReportOEEData = async () => {
        setLoading(true);
        const query = {};
        if (params.plantId) {
          query.plantId = params.plantId;
        }
        if (params.machineId) {
          query.id = params.machineId;
        }
        const ReportOEEData = await client.service("machines").find({
          query: {
            ...query,
            $reportOEE: {
              sd: moment(stringStartDate).toDate(),
              ed: moment(stringEndDate).toDate(),
            },
            machineStatusId: lodashGet(
              client.get("config.machine.status.active"),
              "value"
            ),
            $sort: {
              identity: 1,
            },
          },
        });
        setAvailabilityData(ReportOEEData.graphAvailability);
        setQualityData(ReportOEEData.graphQuality);
        setPerformanceData(ReportOEEData.graphPerformance);
        setOEEData(ReportOEEData.graphOEE);
        setActionsData(ReportOEEData.graphActions);
        setStatsData(ReportOEEData.graphStats);
        setLoading(false);
      };
      asyncGetReportOEEData();
    }, [
      client,
      stringStartDate,
      stringEndDate,
      params.plantId,
      params.machineId,
    ]),
    1000
  );
  const [getGraphOEEData] = useDebouncedCallback(
    useCallback(() => {
      const asyncGetGraphOEEData = async () => {
        setLoadingGraph(true);
        const query = {};
        if (params.plantId) {
          query.plantId = params.plantId;
        }
        if (params.machineId) {
          query.id = params.machineId;
        }
        let sd = moment(stringStartDate);
        let ed = moment(stringEndDate);
        if (moment(ed).diff(moment(sd), "days") < 7) {
          sd = moment(ed).subtract(7, "days").startOf("day").add(6, "hours");
        }
        const dates = [];
        for (let i = 0; i <= moment(ed).diff(moment(sd), "days"); i++) {
          dates.push({
            sd: moment(sd).add(i, "days").startOf("day").add(6, "hours"),
            ed: moment(sd).add(i, "days").endOf("day").add(6, "hours"),
          });
        }
        const GraphOEEData = await client.service("machines").find({
          query: {
            ...query,
            $reportIndicators: {
              sd: moment(sd).toDate(),
              ed: moment(ed).toDate(),
              dates,
            },
            machineStatusId: lodashGet(
              client.get("config.machine.status.active"),
              "value"
            ),
            $sort: {
              identity: 1,
            },
          },
        });
        lodashForEach(GraphOEEData.graphIndicators.series, (item) => {
          item.value = lodashMap(item.value, (v) => (v > 110 ? 110 : v));
        });
        setGraphOEEData(GraphOEEData.graphIndicators);
        setLoadingGraph(false);
      };
      asyncGetGraphOEEData();
    }, [
      client,
      stringStartDate,
      stringEndDate,
      params.plantId,
      params.machineId,
    ]),
    1000
  );
  useEffect(() => {
    // console.log("!!! useEffect getReportOEEData");
    if (timeCarousel) {
      setLoading(true);
      setTimeout(() => {
        getReportOEEData();
      }, timeCarousel * 1000);
    } else {
      setLoading(true);
      getReportOEEData();
    }
  }, [getReportOEEData]);
  useEffect(() => {
    // console.log("!!! useEffect getGraphOEEData");
    if (timeCarousel) {
      setLoadingGraph(true);
      setTimeout(() => {
        getGraphOEEData();
      }, timeCarousel * 1000);
    } else {
      setLoadingGraph(true);
      getGraphOEEData();
    }
  }, [getGraphOEEData]);
  // TODO dependencies startDate.toISOString(), endDate.toISOString(),
  const graphOEEOptions = {
    high: 110,
    low: 0,
    height: 250,
    axisX: {
      showGrid: false,
    },
    axisY: {
      offset: 20,
      high: 110,
      low: 0,
      type: Chartist.FixedScaleAxis,
      ticks: [0, 20, 40, 60, 80, 100],
      labelInterpolationFnc: (value) => `${value}%`,
    },
    series: {
      OEE: {
        showArea: true,
      },
    },
    plugins: [
      Chartist.plugins.tooltip({
        appendToBody: true,
        class: "gauge-tooltip",
        tooltipFnc: (meta, value) =>
          `${meta ? `${meta} ` : ""}${NUMBER_FORMAT(
            parseFloat(value).toFixed(2)
          )}`,
      }),
    ],
  };
  const fillBarColor = {
    draw: (context) => {
      if (context.series) {
        context.element.attr({
          style: `stroke: ${context.series.bgColor};`,
        });
      }
    },
  };
  const urlParams = new URLSearchParams(window.location.search);
  const sd = urlParams.get("sd");
  const ed = urlParams.get("ed");
  useEffect(() => {
    // console.log("~char", Chartist);
    if (sd) {
      setStartDate(moment(sd));
    }
    if (ed) {
      setEndDate(moment(ed));
    }
  }, [sd, ed]);
  return (
    <Grid
      container
      direction="column"
      spacing={0}
      className={classes.container}
    >
      <Grid item>
        <Toolbar className={classes.toolbar}>
          <Typography variant="body1" className={classes.toolbarTitle}>
            OEE
          </Typography>
          <div style={{ flex: 1 }} />
          <DateFilter
            date={startDate}
            setDate={(date) => {
              setStartDate(moment(date));
              setEndDate(
                (moment(date)
                  .add(6, "days")
                  .isAfter(moment().subtract(1, "days"), "minute")
                  ? moment().subtract(1, "days")
                  : moment(date).add(6, "days")
                )
                  .endOf("day")
                  .add(6, "hours")
              );
            }}
            // minDate={moment(endDate).subtract(30, "days")}
            maxDate={moment(endDate).subtract(1, "days")}
          />
          <Hidden smDown>
            <Typography variant="body1" className={classes.toolbarLabel}>
              até
            </Typography>
          </Hidden>
          <DateFilter
            isEndDate
            date={endDate}
            setDate={setEndDate}
            minDate={moment(startDate).add(1, "days")}
            maxDate={
              moment(startDate).add(7, "days").isAfter(moment(), "minute")
                ? moment()
                : moment(startDate).add(7, "days")
            }
          />
        </Toolbar>
      </Grid>
      <Grid container item spacing={2} className={classes.wrapper}>
        {/* <Hidden smDown> */}
        {pathname !== "/reports/carousel" && (
          <Grid item className={classes.tree}>
            <Paper elevation={4}>
              <Tree
                model={{
                  name: "plants",
                  formPath: "/reports/production-oee/plant",
                  paramsProp: "plantId",
                }}
                query={{
                  plantStatusId: lodashGet(
                    client.get("config.plant.status.active"),
                    "value"
                  ),
                  $sort: {
                    name: 1,
                  },
                }}
                customContent={{
                  beforeTree: () => (
                    <Grid item component={Link} to="/reports/production-oee">
                      <Typography
                        className={classNames(
                          {
                            [classes.treeItemSelected]: !params.plantId,
                          },
                          classes.allPlants
                        )}
                        variant="body1"
                      >
                        TODAS
                      </Typography>
                    </Grid>
                  ),
                  afterTreeItem: ({ data }) =>
                    data.id && (
                      <PlantMachinesList
                        model={{
                          ...MachinesModel.metadata,
                          formPath: "/reports/production-oee/plant",
                          icon: "style",
                        }}
                        plant={data}
                      />
                    ),
                }}
              />
            </Paper>
          </Grid>
        )}
        {/* </Hidden> */}
        <Grid item className={classes.content}>
          <Grid item container spacing={2}>
            <Grid item xs={12} sm={4} className={classes.graphItem}>
              <div className={classes.graphWrapper}>
                <Icon className={classes.graphIcon}>donut_large</Icon>
                <Typography className={classes.graphTitle} variant="body1">
                  OEE
                </Typography>
              </div>
              {loading && <Loader />}
              {!loading && <GaugeChart value={oeeData} />}
            </Grid>
            <Grid item xs={12} sm={4} className={classes.graphItem}>
              <div className={classes.graphWrapper}>
                <Icon className={classes.graphIcon}>view_week</Icon>
                <Typography className={classes.graphTitle} variant="body1">
                  Indicadores
                </Typography>
              </div>
              {loading && <Loader />}
              {!loading && (
                <React.Fragment>
                  <Grid item container spacing={2}>
                    <BarChart text="Disponibilidade" data={availabilityData} />
                    <BarChart text="Qualidade" data={qualityData} />
                    <BarChart text="Performance" data={performanceData} />
                  </Grid>
                </React.Fragment>
              )}
            </Grid>
            <Grid item xs={12} sm={4} className={classes.graphItem}>
              <div className={classes.graphWrapper}>
                <Icon className={classes.graphIcon}>pie_chart</Icon>
                <Typography className={classes.graphTitle} variant="body1">
                  Disponibilidade
                </Typography>
              </div>
              {loading && <Loader />}
              {!loading && (
                <PieChart
                  options={{
                    chartPadding: 20,
                    labelOffset: 50,
                    height: 200,
                  }}
                  data={actionsData}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={3} className={classes.graphSidebar}>
              <Grid item xs={12} className={classes.graphItem}>
                <div
                  className={classes.graphItemDetail}
                  style={{
                    background: lodashGet(
                      availabilityData,
                      "series.0.0.bgColor"
                    ),
                  }}
                >
                  <Typography
                    className={classes.graphSidebarTitle}
                    variant="body1"
                  >
                    Disponibilidade
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Tempo Operação:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={
                          Math.round((statsData.productionTime / 60) * 100) /
                          100
                        }
                        displayType={"text"}
                      />{" "}
                      h{loading && <Loader />}
                    </span>
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Tempo Planejado:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={
                          Math.round((statsData.plannedTime / 60) * 100) / 100
                        }
                        displayType={"text"}
                      />{" "}
                      h{loading && <Loader />}
                    </span>
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} className={classes.graphItem}>
                <div
                  className={classes.graphItemDetail}
                  style={{
                    background: lodashGet(qualityData, "series.0.0.bgColor"),
                  }}
                >
                  <Typography
                    className={classes.graphSidebarTitle}
                    variant="body1"
                  >
                    Qualidade
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Prod. Total:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={statsData.totalProductionInEvents}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />
                      {loading && <Loader />}
                    </span>
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Prod. Confirmada:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={statsData.confirmedProductionInEvents}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />
                      {loading && <Loader />}
                    </span>
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Refugo:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={statsData.wastedProductionInEvents}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />
                      {loading && <Loader />}
                    </span>
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={12} className={classes.graphItem}>
                <div
                  className={classes.graphItemDetail}
                  style={{
                    background: lodashGet(
                      performanceData,
                      "series.0.0.bgColor"
                    ),
                  }}
                >
                  <Typography
                    className={classes.graphSidebarTitle}
                    variant="body1"
                  >
                    Performance
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Ciclos:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={statsData.readingsInEvents}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />
                      {loading && <Loader />}
                    </span>
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Ciclo Ideal:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={statsData.idealCycle}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />{" "}
                      s{loading && <Loader />}
                    </span>
                  </Typography>
                  <Typography
                    className={classes.graphDetailTitle}
                    variant="body1"
                  >
                    Ciclo Real:{" "}
                    <span className={classes.graphDetail}>
                      <NumberFormat
                        value={statsData.realCycleInEvents}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />{" "}
                      s{loading && <Loader />}
                    </span>
                  </Typography>
                </div>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={9} className={classes.graphItem}>
              {/* <div className={classes.graphWrapper}>
                <Icon className={classes.graphIcon}>view_week</Icon>
                <Typography className={classes.graphTitle} variant="body1">
                  Indicadores
                </Typography>
              </div> */}
              {loadingGraph && <Loader />}
              {!loadingGraph && (
                <React.Fragment>
                  <Paper className={classes.legend}>
                    {lodashMap(
                      ["Disponibilidade", "Qualidade", "Performance", "OEE"],
                      (legend, index) => (
                        <div key={index} className={classes.titleLegend}>
                          <i
                            className={classes.iconLegend}
                            style={{
                              background: lodashGet(
                                graphOEEData,
                                `series.${index}.bgColor`
                              ),
                            }}
                          />{" "}
                          {legend}
                        </div>
                      )
                    )}
                  </Paper>
                  <ChartistGraph
                    type="Line"
                    className="ct-indicators"
                    data={graphOEEData}
                    options={graphOEEOptions}
                    listener={fillBarColor}
                    style={{ padding: theme.spacing(2) }}
                  />
                </React.Fragment>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default withRouter(
  withStyles(styles, { withTheme: true })(ProductionOEE)
);
