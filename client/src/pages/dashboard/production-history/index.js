import React, { useContext, useState, useEffect, useCallback } from "react";
import moment from "moment";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Toolbar,
  Hidden
} from "@material-ui/core";
import { useDebouncedCallback } from "use-debounce";
import ApiContext from "../../../api";
import {
  withRouter,
  withStyles,
  lodashGet,
  lodashMap,
  lodashFindIndex,
  lodashForEach
} from "../../../utils";
import { Loader } from "../../../components";
import DateFilter from "../DateFilter";
import PlantFilter from "../PlantFilter";
import MachineRow from "./MachineRow";
import ProductionGauge from "./ProductionGauge";
import { LinearProgress } from "@material-ui/core";

const styles = theme => ({
  title: {
    fontSize: "1rem"
  },
  label: {
    padding: `0 ${theme.spacing(1)}px`,
    fontSize: "1rem"
  },
  container: {
    height: "100%",
    flexWrap: "nowrap",
    overflow: "visible"
  },
  wrapper: {
    position: "relative",
    overflow: "auto",
    flex: 1,
    top: theme.spacing(1),
    width: `calc(100% + ${theme.spacing(6)}px)`,
    margin: -theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      top: 0,
      margin: -theme.spacing(1),
      width: `calc(100% + ${theme.spacing(2)}px)`
    }
  },
  header: {
    height: "56px",
    //whiteSpace: 'nowrap',
    "& th": {
      padding: `0 ${theme.spacing(2)}px`,
      textTransform: "uppercase",
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      "& p,& a span": {
        color: theme.palette.common.white,
        fontSize: ".75rem"
      }
    },
    [theme.breakpoints.up("sm")]: {
      position: "sticky",
      top: 0,
      zIndex: 1
    }
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
      width: `calc(100% + ${theme.spacing(2)}px)`
    }
  },
  scrollArea: {
    height: "100%"
  },
  loader: {
    marginBottom: "-4px",
    zIndex: "2"
    // color: theme.palette.secondary.main,
    // backgroundColor: theme.palette.primary.main,
  }
});

const ProductionHistory = ({ classes, match: { params }, timeCarousel, limit, offset }) => {
  const client = useContext(ApiContext);
  const [reportHistoryData, setReportHistoryData] = useState([]);
  const [typesMap, setTypesMap] = useState({});
  const [loading, setLoading] = useState();
  const [plantIdQuery, setPlantIdQuery] = useState({});
  const [date, setDate] = useState(
    moment().isAfter(
      moment()
        .startOf("day")
        .add(6, "hours"),
      "minute"
    )
      ? moment()
        .startOf("day")
        .add(6, "hours")
      : moment()
        .subtract(1, "day")
        .startOf("day")
        .add(6, "hours")
  );
  const stringDate = date.toISOString();
  const stringQuery = JSON.stringify(plantIdQuery);
  const isSameDay = moment().isSame(date, "day");
  const [getReportHistoryData] = useDebouncedCallback(
    useCallback(
      ({ machineId } = {}) => {
        const asyncGetReportHistoryData = async () => {
          setLoading(true);
          const companyQuery = {};
          if (params.companyId) {
            companyQuery.$adminQueryCompanyId = params.companyId;
          }
          const machineQuery = {};
          if (machineId) {
            machineQuery.id = machineId;
          }
          const ReportHistoryData = await client.service("machines").find({
            query: {
              ...JSON.parse(stringQuery),
              ...companyQuery,
              ...machineQuery,
              $reportHistory: {
                sd: moment(stringDate)
                  .startOf("day")
                  .add(6, "hours")
                  .toDate(),
                ed: moment(stringDate)
                  .endOf("day")
                  .add(6, "hours")
                  .toDate(),
                cd: moment().toDate(),
                same: isSameDay
              },
              machineStatusId: lodashGet(
                client.get("config.machine.status.active"),
                "value"
              ),
              $sort: {
                identity: 1
              },
              $limit: limit,
              $skip: offset
            }
          });
          if (machineId) {
            setReportHistoryData(prev => {
              const index = lodashFindIndex(prev, { id: machineId });
              if (index !== -1) {
                prev[index] = ReportHistoryData.data[0];
                // } else { // TODO add new machines too?
                //   return [...prev, ...ReportHistoryData.data];
              }
              return [...prev];
            });
          } else {
            setReportHistoryData(ReportHistoryData.data);
          }
          setLoading(false);
        };
        asyncGetReportHistoryData();
      },
      [client, stringDate, params.companyId, stringQuery, isSameDay]
    ),
    1000
  );
  // TODO do the same to ALL reports calls
  useEffect(() => {
    // console.log("!!! useEffect getReportHistoryData");
    if (timeCarousel) {
      setTimeout(() => {
        getReportHistoryData();
      }, timeCarousel * 1000);
    } else {
      getReportHistoryData();
    }
  }, [getReportHistoryData]);
  useEffect(() => {
    // console.log("!!! useEffect getReportHistoryData");
    let getReportHistoryDataInterval;
    if (isSameDay) {
      getReportHistoryDataInterval = setInterval(() => {
        getReportHistoryData();
      }, 5 * 60 * 1000);
    }
    return () => {
      clearInterval(getReportHistoryDataInterval);
    };
  }, [client, getReportHistoryData, isSameDay]);
  useEffect(() => {
    const findEvents = async () => {
      const { data: eventTypes } = await client.service("production_order_event_types").find();
      const getTypesMap = {};
      lodashForEach(eventTypes, type => (getTypesMap[type.id] = type));
      setTypesMap(getTypesMap);
    };
    findEvents();
  }, [client]);
  return (
    <Grid
      container
      direction="column"
      spacing={0}
      className={classes.container}
    >
      <Grid item>
        <Toolbar className={classes.toolbar}>
          <Typography variant="body1" className={classes.title}>
            Histórico de Produção
          </Typography>
          <div style={{ flex: 1 }} />
          <DateFilter date={date} setDate={setDate} maxDate={moment()} />
          <PlantFilter setQuery={setPlantIdQuery} />
        </Toolbar>
      </Grid>
      <Grid item className={classes.wrapper}>
        {loading && <LinearProgress className={classes.loader} />}
        <Table id="tableId" className={classes.table}>
          <colgroup>
            <Hidden smDown>
              <col width="135px" />
            </Hidden>
            <Hidden mdUp>
              <col width="50px" />
            </Hidden>
            <col />
            <col width="50px" />
            {isSameDay && <col width="70px" />}
          </colgroup>
          <TableHead>
            <TableRow className={classes.header}>
              <TableCell className={classes.header}>
                <Typography variant="body1">Máquina</Typography>
              </TableCell>
              <TableCell className={classes.header}>
                <ProductionGauge
                  data={[30, 30, 30, 30]}
                  filters={{
                    sd: moment(date).startOf("day"),
                    ed: moment(date).endOf("day")
                  }}
                  header
                />
              </TableCell>
              <TableCell className={classes.header}>
                <Typography variant="body1">Disp.</Typography>
              </TableCell>
              {isSameDay && (
                <TableCell className={classes.header}>
                  <Typography variant="body1">Status</Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {lodashMap(reportHistoryData, item => (
              <MachineRow
                key={item.id}
                machine={item}
                typesMap={typesMap}
                filters={{
                  sd: moment(date).startOf("day"),
                  ed: moment(date).endOf("day")
                }}
                isSameDay={isSameDay}
                reload={getReportHistoryData}
              />
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default withRouter(
  withStyles(styles, { withTheme: true })(ProductionHistory)
);
