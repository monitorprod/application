import React, { useContext, useState, useEffect } from "react";
import moment from "moment";
import NumberFormat from "react-number-format";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import {
  Grid,
  Typography,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary
} from "@material-ui/core";
import ApiContext from "../../../../api";
import {
  withStyles,
  lodashGet,
  lodashForEach,
  lodashMap,
  getColor,
  getLastReadingCycle,
  getPermissions,
  useAuth
} from "../../../../utils";
import { Loader, Button } from "../../../../components";
import StatusLine from "./StatusLine";

const styles = theme => ({
  container: {
    flexWrap: "nowrap"
  },
  header: {
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    backgroundColor: theme.palette.primary.form,
    "&>div": {
      margin: "0px !important"
    }
  },
  wrapper: {
    justifyContent: "center",
    flexWrap: "nowrap"
  },
  production: {
    flexDirection: "column",
    flexWrap: "nowrap"
  },
  status: {
    minWidth: 40,
    minHeight: 40,
    width: 40,
    height: 40,
    borderRadius: "50%",
    flexWrap: "nowrap",
    justifyContent: "center",
    color: theme.palette.common.white,
    padding: `0 ${theme.spacing(1)}px !important`,
    fontSize: ".65rem"
  },
  divider: {
    width: "100%",
    border: `1px solid ${theme.palette.common.white}`
  },
  eventDetail: {
    flexWrap: "nowrap"
  },
  label: {
    padding: `0 ${theme.spacing(1 / 2)}px`
  },
  details: {
    display: "block",
    padding: theme.spacing(2)
  },
  item: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    borderBottom: `1px solid ${theme.palette.primary.form}`
  },
  panel: {
    "& > div:nth-child(2)": {
      margin: `0 ${theme.spacing(2)}px`
    }
  },
  turnName: {
    fontStyle: "italic"
  }
});

const Status = ({ classes, productionOrder, formItem }) => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  const client = useContext(ApiContext);
  const [currentOp, setCurrentOp] = useState()
  const [cycle, setCycleValue] = useState();
  const [events, setEvents] = useState([]);
  const [typesMap, setTypesMap] = useState({});
  const [isExpanded, setIsExpanded] = useState();
  const [loading, setLoading] = useState();
  const [page, setPage] = useState(0);
  const [paginatedList, setPaginatedList] = useState([]);
  const [historyResult, setHistoryResult] = useState();
  const handleExpand = () => setIsExpanded(prev => !prev);
  const stringProductionOrder = JSON.stringify(productionOrder);
  useEffect(() => {
    // console.log("!!! effect STATUS setCycleValue");
    setCycleValue(getLastReadingCycle({ data: JSON.parse(stringProductionOrder) }).toFixed(1));
  }, [stringProductionOrder]);
  useEffect(() => {
    // console.log("!!! effect STATUS findEvents");
    const parsedProductionOrder = JSON.parse(stringProductionOrder);
    const findEvents = async () => {
      if (parsedProductionOrder) {
        setLoading(true);
        const { data: eventTypes } = await client.service("production_order_event_types").find();
        const getTypesMap = {};
        lodashForEach(eventTypes, type => (getTypesMap[type.id] = type));
        setTypesMap(getTypesMap);
        const history = lodashGet(
          await client.service("production_order_history").find({
            query: { poi: parsedProductionOrder.id, $populateUsers: true }
          }),
          "data.0"
        );
        if (parsedProductionOrder.id !== currentOp) {
          setCurrentOp(parsedProductionOrder.id);
          setPaginatedList([]);
          setPage(0);
        }
        if (history) {
          setEvents(history.ev.reverse());
          setHistoryResult(history);
        } else {
          setEvents([]);
        }
        setLoading(false);
      }
    };
    if (isExpanded) {
      findEvents();
    }
  }, [client, stringProductionOrder, isExpanded]);
  useEffect(() => {
    if (events.length > page * 50) {
      setPaginatedList(prev => [...prev, ...events.slice(page * 50, (page + 1) * 50)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, page]);
  const undefinedProduction = lodashGet(
    // TODO replace all for getEvent util
    client.get(
      `actionType.${lodashGet(client.get("config.productionOrder.eventType.undefined"), "value")}`
    ),
    "name"
  );
  const confirmedProduction =
    lodashGet(productionOrder, "confirmedProduction") ||
    lodashGet(productionOrder, "totalProduction");
  const missingProduction =
    parseInt(lodashGet(productionOrder, "expectedProduction"), "10") -
      parseInt(confirmedProduction, "10") || undefinedProduction;
  const expectedEndDate = moment();
  const expectedProduction =
    parseInt(formItem.expectedProduction, "10") - (parseInt(formItem.totalProduction, "10") || 0) ||
    0;
  // seconds (UM) per minute / idealCycle * openCavities gives production per minute
  const productionTime =
    expectedProduction /
    ((60 / (parseFloat(formItem.idealCycle, "10") || 1)) *
      (parseInt(formItem.openCavities, "10") || 1));
  expectedEndDate.add(productionTime || 0, "m");
  const { permissions } = useAuth();
  const hasEditAccess = getPermissions({
    privileges: ["editProductionOrderEvents"],
    permissions
  });
  return (
    (lodashGet(productionOrder, "isActive") || lodashGet(productionOrder, "isClosed")) && (
      <Grid item className={classes.container}>
        <ExpansionPanel className={classes.panel} expanded={isExpanded} onChange={handleExpand}>
          <ExpansionPanelSummary className={classes.header} expandIcon={<ExpandMoreIcon />}>
            <Grid container spacing={2}>
              <Grid item container alignItems="center" spacing={2} className={classes.wrapper}>
                <Grid
                  item
                  container
                  direction="column"
                  alignItems="center"
                  spacing={0}
                  className={classes.status}
                  style={{
                    backgroundColor: getColor({
                      data: productionOrder,
                      path:
                        "mostRecentEvent.0.productionOrderEventType.production_order_action_type.color"
                    })
                  }}
                >
                  <span>{cycle}</span>
                  <div className={classes.divider} />
                  <span>{productionOrder.idealCycle}</span>
                </Grid>
                <Grid item>
                  <Typography variant="body1">
                    {`${lodashGet(
                      productionOrder,
                      "mostRecentEvent.0.productionOrderEventType.name"
                    )} - ${moment(
                      lodashGet(productionOrder, "mostRecentEvent.0.ed") === -1
                        ? moment()
                        : lodashGet(productionOrder, "mostRecentEvent.0.ed")
                    ).format("DD/MM/YYYY HH:mm")}`}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item container spacing={2} alignItems="center" className={classes.production}>
                {level === "N1" &&
                  lodashGet(productionOrder, "production_order_type.isInProduction") &&
                  (missingProduction < 0 || missingProduction === undefinedProduction) && (
                    <Typography variant="body2" noWrap>
                      PRODUÇÃO ESPERADA EXCEDIDA
                    </Typography>
                  )}
                {level === "N1" &&
                  lodashGet(productionOrder, "production_order_type.isInProduction") && (
                    <Typography variant="body2" noWrap>
                      PROG:{" "}
                      <NumberFormat
                        value={`${lodashGet(productionOrder, "expectedProduction")}`}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />{" "}
                      / PRODUZ:{" "}
                      <NumberFormat
                        value={`${lodashGet(productionOrder, "totalProduction")}`}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />{" "}
                      / CONFIRM:{" "}
                      <NumberFormat
                        value={confirmedProduction}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />{" "}
                      / FALTA:{" "}
                      <NumberFormat
                        value={missingProduction}
                        displayType={"text"}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                      />
                    </Typography>
                  )}
                <Typography color="textSecondary" noWrap>
                  DATA INICIO:{" "}
                  {moment(lodashGet(productionOrder, "actualStartDate")).format(
                    "ddd, DD [de] MMM [de] YYYY HH:mm"
                  )}
                </Typography>
                {lodashGet(productionOrder, "isActive") &&
                  lodashGet(productionOrder, "production_order_type.isInProduction") &&
                  level === "N1" && (
                    <Typography color="textSecondary" noWrap>
                      DATA FIM PREVISTA:{" "}
                      {moment(expectedEndDate).format("ddd, DD [de] MMM [de] YYYY HH:mm")}
                    </Typography>
                  )}
                {lodashGet(productionOrder, "isClosed") && (
                  <Typography color="textSecondary" noWrap>
                    DATA FIM:{" "}
                    {moment(lodashGet(productionOrder, "actualEndDate")).format(
                      "ddd, DD [de] MMM [de] YYYY HH:mm"
                    )}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </ExpansionPanelSummary>
          <div style={{ width: "100%", height: 500, overflow:'overlay' }}>
            <ExpansionPanelDetails className={classes.details}>
              {loading && <Loader />}
              {!loading && paginatedList.length > 0 && (
                <AutoSizer disableHeight style={{ width: "100%" }}>
                  {({ width }) => (
                    <div width={width} rowHeight={60}>
                      {lodashMap(paginatedList, (event, index) => {
                        const nextEV = events[index + 1];
                        return (
                          <React.Fragment key={index}>
                            <Grid
                              container
                              alignItems="center"
                              spacing={2}
                              className={classes.eventDetail}
                            >
                              <StatusLine
                                index={events.length - 1 - index}
                                isFirst={index === 0}
                                hasEditAccess={hasEditAccess}
                                history={historyResult}
                                typesMap={typesMap}
                                event={event}
                              />
                            </Grid>
                            {(!nextEV ||
                              (nextEV && `${nextEV.tu || -1}` !== `${event.tu || -1}`)) && (
                              <Grid
                                key={index}
                                container
                                alignItems="center"
                                spacing={2}
                                className={classes.eventDetail}
                              >
                                <Grid item className={classes.item}>
                                  <Typography
                                    className={classes.turnName}
                                    variant="body1"
                                    style={{ flex: "1" }}
                                  >
                                    {event.tu ? `Inicio de turno ${event.turnName}` : `Sem turno`}
                                  </Typography>
                                </Grid>
                              </Grid>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {events.length > paginatedList.length && (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Button text="Mostrar mais" onClick={() => setPage(prev => prev + 1)} />
                        </div>
                      )}
                    </div>
                  )}
                </AutoSizer>
              )}
            </ExpansionPanelDetails>
          </div>
        </ExpansionPanel>
      </Grid>
    )
  );
};

export default withStyles(styles, { withTheme: true })(Status);
