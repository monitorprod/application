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
  withStyles,
  lodashGet,
  lodashMap,
  lodashForEach,
  lodashFilter,
  lodashReduce,
  lodashIsNil,
  getDateJSON,
  getPermissions,
  useAuth
} from "../../../utils";
import { Loader, Button } from "../../../components";
import DataRow from "./DataRow";
import DateFilter from "../DateFilter";
import PlantFilter from "../PlantFilter";
import MenuFilter from "../production-report/MenuFilter";

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
    "& th": {
      padding: `0 ${theme.spacing(1)}px`,
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
  export: {
    minWidth: "auto"
  },
  exportWrapper: {
    position: "relative",
    display: "flex"
  },
  exportLoader: {
    width: "100%",
    position: "absolute",
    alignSelf: "center"
  },
  scrollArea: {
    height: "100%"
  }
});

const ProductionWaste = ({ classes }) => {
  const { permissions } = useAuth();
  const client = useContext(ApiContext);
  const [pendingWasteData, setPendingWasteData] = useState([]);
  const [header, setHeader] = useState([]);
  const [loading, setLoading] = useState();
  const [startDate, setStartDate] = useState(
    moment()
      .subtract(1, "day")
      .startOf("day")
      .add(6, "hours")
  );
  const [endDate, setEndDate] = useState(
    moment()
      .subtract(1, "day")
      .endOf("day")
      .add(6, "hours")
  );
  const historyByTextMap = {
    waste: "Pendentes",
    history: "Histórico"
  };
  const [historyBy, setHistoryBy] = useState();
  const typesByTextMap = {
    all: "Todas",
    active: "Ativas",
    closed: "Encerradas"
  };
  const [typesBy, setTypesBy] = useState("all");
  const [groupByExpandMap, setGroupByExpandMap] = useState();
  const [plantIdQuery, setPlantIdQuery] = useState({});
  const handleGroupExpand = ({ id }) => () =>
    setGroupByExpandMap(prev => ({ ...prev, [id]: !prev[id] }));
  const stringStartDate = startDate.toISOString();
  const stringEndDate = endDate.toISOString();
  const stringQuery = JSON.stringify(plantIdQuery);
  const [getPendingWasteData] = useDebouncedCallback(
    useCallback(() => {
      const asyncGetPendingWasteData = async () => {
        setLoading(true);
        const PendingWasteData = await client.service("machines").find({
          query: {
            ...JSON.parse(stringQuery),
            $pendingWaste: {
              sd: getDateJSON({ date: moment(stringStartDate) }),
              ed: getDateJSON({ date: moment(stringEndDate) }),
              typesBy,
              historyBy
            },
            machineStatusId: lodashGet(client.get("config.machine.status.active"), "value")
          }
        });
        // console.log("PendingWasteData", PendingWasteData)
        const expandMap = {};
        lodashForEach(PendingWasteData.groupBy, item => {
          expandMap[lodashGet(item, "machine.id")] = true;
        });
        setGroupByExpandMap(expandMap);
        setPendingWasteData(PendingWasteData.groupBy);
        setHeader(PendingWasteData.header);
        setLoading(false);
      };
      asyncGetPendingWasteData();
    }, [client, stringStartDate, stringEndDate, typesBy, historyBy, stringQuery]),
    1000
  );
  useEffect(() => {
    // TODO useDebounce
    if (!historyBy) {
      return;
    }
    // console.log("!!! useEffect getPendingWasteData");
    setLoading(true);
    getPendingWasteData();
  }, [getPendingWasteData, historyBy]);
  const [loadingSubmit, setLoadingSubmit] = useState();
  const handleSubmit = async () => {
    if (loadingSubmit) {
      return;
    }
    setLoadingSubmit(true);
    await Promise.all(
      lodashMap(pendingWasteData, async wItem => {
        await lodashReduce(
          wItem.groupData,
          async (promise, item) => {
            await promise;
            const setFormErrors = item.setFormErrors || (() => {});
            setFormErrors({});
            let continueOperation = true;
            if (!lodashIsNil(item.cp) || !lodashIsNil(item.wp)) {
              const cp = parseInt(item.cp, "10");
              if (cp < 0) {
                continueOperation = false;
                setFormErrors(prev => ({
                  ...prev,
                  cp: "Q Confirmada não pode ser negativo"
                }));
              }
              const wp = parseInt(item.wp, "10");
              if (wp < 0) {
                continueOperation = false;
                setFormErrors(prev => ({
                  ...prev,
                  wp: "Q Refugo não pode ser negativo"
                }));
              }
              if (lodashGet(item, "plant.wasteJustification") && !item.wji && item.wp) {
                continueOperation = false;
                setFormErrors(prev => ({
                  ...prev,
                  wji: "Campo obrigatório."
                }));
              }
              if (!continueOperation) {
                return Promise.resolve();
              }
              item.dontShow = true;
              const newWaste = {
                poi: lodashGet(item, "poi.id"),
                mi: lodashGet(item, "poi.machineId"),
                ti: lodashGet(item, "turn.id"),
                sd: lodashGet(item, "sd"),
                ed: lodashGet(item, "ed"),
                tp: item.tp || 0,
                cp: item.cp || 0,
                wp: item.wp || 0,
                wji: item.wji
              };
              return client.service("production_order_waste").create(newWaste);
            }
          },
          Promise.resolve()
        );
      })
    );
    setLoadingSubmit(false);
  };
  const hasWriteAccess = getPermissions({
    privileges: ["writePendingWaste"],
    permissions
  });
  useEffect(() => {
    setHistoryBy(hasWriteAccess ? "waste" : "history");
  }, [hasWriteAccess]);
  return (
    <Grid container direction="column" spacing={0} className={classes.container}>
      <Grid item>
        <Toolbar className={classes.toolbar}>
          <Typography variant="body1" className={classes.title}>
            Apontamento de Refugo
          </Typography>
          <div className={classes.exportWrapper}>
            {loadingSubmit && (
              <div className={classes.exportLoader}>
                <Loader />
              </div>
            )}
            {historyBy !== "history" && (
              <Button
                className={classes.export}
                onClick={handleSubmit}
                text="Gravar"
                type="icon"
                icon="save"
              />
            )}
          </div>
          <MenuFilter
            identity="history-by"
            filter={historyBy}
            setFilter={setHistoryBy}
            options={historyByTextMap}
          />
          <div style={{ flex: 1 }} />
          <Hidden smDown>
            <MenuFilter
              identity="events-by"
              filter={typesBy}
              setFilter={setTypesBy}
              options={typesByTextMap}
            />
          </Hidden>
          <DateFilter
            date={startDate}
            setDate={setStartDate}
            maxDate={moment(endDate).subtract(1, "days")}
          />
          <Hidden smDown>
            <Typography variant="body1" className={classes.label}>
              até
            </Typography>
          </Hidden>
          <DateFilter
            isEndDate
            date={endDate}
            setDate={setEndDate}
            minDate={startDate}
            maxDate={moment().add(1, "days")}
          />
          <PlantFilter setQuery={setPlantIdQuery} />
        </Toolbar>
      </Grid>
      <Grid item className={classes.wrapper}>
        {loading && <Loader />}
        {!loading && (
          <Table id="tableId" className={classes.table}>
            <TableHead>
              <TableRow className={classes.header}>
                {lodashMap(header, ({ text }, index) => (
                  <TableCell key={index} className={classes.header}>
                    <Typography variant="body1">{text}</Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {lodashMap(pendingWasteData, (wItem, index) => (
                <React.Fragment key={index}>
                  <React.Fragment>
                    <DataRow
                      header={header}
                      item={wItem.groupTotal}
                      groupBy={{
                        handleGroupExpand,
                        expandId: lodashGet(wItem, "machine.id"),
                        expanded: lodashGet(groupByExpandMap, `${lodashGet(wItem, "machine.id")}`),
                        enabled: true,
                        colspan: wItem.colspan,
                        text: `${lodashGet(wItem, "machine.identity")} - ${lodashGet(
                          wItem,
                          "machine.name"
                        )} ${
                          historyBy === "waste"
                            ? `(${
                                lodashFilter(wItem.groupData, item => !item.dontShow).length
                              } Pendentes)`
                            : ""
                        }`
                      }}
                    />
                    {lodashGet(groupByExpandMap, `${lodashGet(wItem, "machine.id")}`) &&
                      lodashMap(
                        wItem.groupData,
                        (item, index) =>
                          !item.dontShow && (
                            <DataRow
                              key={index}
                              header={header}
                              item={item}
                              historyBy={historyBy}
                            />
                          )
                      )}
                  </React.Fragment>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </Grid>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(ProductionWaste);
