import React, { useContext, useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileExcel } from "@fortawesome/free-solid-svg-icons";
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
  Button,
  Hidden,
} from "@material-ui/core";
import { useDebouncedCallback } from "use-debounce";
import ApiContext from "../../../api";
import {
  withStyles,
  lodashGet,
  lodashMap,
  lodashForEach,
  useAuth,
} from "../../../utils";
import { Loader } from "../../../components";
import DataRow from "./DataRow";
import DateFilter from "../DateFilter";
import PlantFilter from "../PlantFilter";
import MenuFilter from "./MenuFilter";

const styles = (theme) => ({
  title: {
    fontSize: "1rem",
  },
  label: {
    padding: `0 ${theme.spacing(1)}px`,
    fontSize: "1rem",
  },
  container: {
    height: "100%",
    flexWrap: "nowrap",
    overflow: "visible",
  },
  wrapper: {
    position: "relative",
    overflow: "auto",
    flex: 1,
    width: `calc(100% + ${theme.spacing(6)}px)`,
    margin: -theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      top: 0,
      margin: -theme.spacing(1),
      width: `calc(100% + ${theme.spacing(2)}px)`,
    },
  },
  loader: {
    top: theme.spacing(1),
    width: "100%",
    position: "absolute",
  },
  header: {
    //whiteSpace: 'nowrap',
    "& th": {
      padding: `0 ${theme.spacing(1)}px`,
      textTransform: "uppercase",
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      "& p,& a span": {
        color: theme.palette.common.white,
        fontSize: ".75rem",
      },
    },
    [theme.breakpoints.up("sm")]: {
      position: "sticky",
      top: 0,
      zIndex: 1,
    },
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
  export: {
    minWidth: "auto",
    "& svg": {
      height: "1rem",
      width: "1rem !important",
    },
    "& span": {
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      fontSize: "0.75rem",
    },
  },
  exportWrapper: {
    position: "relative",
    display: "flex",
  },
  exportLoader: {
    width: "100%",
    position: "absolute",
    alignSelf: "center",
  },
  scrollArea: {
    height: "100%",
  },
});

const ProductionReport = ({ classes }) => {
  const client = useContext(ApiContext);
  const { session } = useAuth();
  const [availabilityData, setAvailabilityData] = useState([]);
  const [header, setHeader] = useState([]);
  const [loading, setLoading] = useState();
  const [startDate, setStartDate] = useState(
    moment().subtract(7, "days").startOf("day").add(6, "hours")
  );
  const [endDate, setEndDate] = useState(
    moment().subtract(1, "days").endOf("day").add(6, "hours")
  );
  const groupByTextMap = {
    poi: "por Ordem",
    mi: "por Máquina",
    mipoi: "por Máquina e Ordem",
  };
  const [groupBy, setGroupBy] = useState("mipoi");
  const eventsByTextMap = {
    at: "por Tipo de Evento",
    ev: "por Evento",
  };
  const [eventsBy, setEventsBy] = useState("ev");
  const [groupByExpandMap, setGroupByExpandMap] = useState();
  const [plantIdQuery, setPlantIdQuery] = useState({});
  const handleGroupExpand = ({ id }) => () =>
    setGroupByExpandMap((prev) => ({ ...prev, [id]: !prev[id] }));
  const stringStartDate = startDate.toISOString();
  const stringEndDate = endDate.toISOString();
  const stringQuery = JSON.stringify(plantIdQuery);
  const [getReportAvailabilityData] = useDebouncedCallback(
    useCallback(() => {
      const asyncGetReportAvailabilityData = async () => {
        setLoading(true);
        const ReportAvailabilityData = await client.service("machines").find({
          query: {
            ...JSON.parse(stringQuery),
            $reportAvailability: {
              sd: moment(stringStartDate).toDate(),
              ed: moment(stringEndDate).toDate(),
              eventsBy,
              groupBy,
            },
            machineStatusId: lodashGet(
              client.get("config.machine.status.active"),
              "value"
            ),
          },
        });
        if (["mipoi", "mi"].indexOf(groupBy) !== -1) {
          const expandMap = {};
          lodashForEach(ReportAvailabilityData.groupBy, (item) => {
            expandMap[lodashGet(item, "machine.id")] = true;
          });
          setGroupByExpandMap(expandMap);
          setAvailabilityData(ReportAvailabilityData.groupBy);
        } else {
          setAvailabilityData(ReportAvailabilityData.data);
        }
        setHeader(ReportAvailabilityData.header);
        setLoading(false);
      };
      asyncGetReportAvailabilityData();
    }, [
      client,
      stringStartDate,
      stringEndDate,
      eventsBy,
      groupBy,
      stringQuery,
    ]),
    1000
  );
  useEffect(() => {
    // console.log("!!! useEffect getReportAvailabilityData");
    setLoading(true);
    getReportAvailabilityData();
  }, [getReportAvailabilityData]);
  // TODO dependencies startDate.toISOString(), endDate.toISOString()
  const fnExcelReport = () => {
    let tableContent = "<table border='2px'><tr bgcolor='#87AFC6'>";
    let table = document.getElementById("tableId");
    let frameId = document.getElementById("frameId");
    for (let i = 0; i < table.rows.length; i++) {
      tableContent = tableContent + table.rows[i].innerHTML + "</tr>";
    }
    tableContent = tableContent + "</table>";
    tableContent = tableContent.replace(/<A[^>]*>|<\/A>/g, ""); //remove if u want links in your table
    tableContent = tableContent.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
    tableContent = tableContent.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params
    let ua = window.navigator.userAgent;
    let msie = ua.indexOf("MSIE ");
    let sa;
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      frameId.document.open("txt/html", "replace");
      frameId.document.write(tableContent);
      frameId.document.close();
      frameId.focus();
      sa = frameId.document.execCommand(
        "SaveAs",
        true,
        "Say Thanks to Sumit.xls"
      );
    } else {
      sa = window.open(
        "data:application/vnd.ms-excel," + encodeURIComponent(tableContent)
      );
    }
    return sa;
  };
  const [loadingPDF, setLoadingPDF] = useState();
  const fnPDFReport = async () => {
    if (loadingPDF) {
      return;
    }
    setLoadingPDF(true);
    let response = await fetch(
      `${client.get("cloudURL")}/report_pdf?uuid=${lodashGet(
        session,
        "company.uuid"
      )}&sd=${startDate.toDate()}&ed=${endDate.toDate()}`
    );
    response = await response.blob();
    let linkPDF = document.createElement("a");
    linkPDF.href = window.URL.createObjectURL(response);
    linkPDF.download = `Relatório de Produção ${startDate.format(
      "YYYY-MMM-DD"
    )} ${endDate.format("YYYY-MMM-DD")}.pdf`;
    document.body.appendChild(linkPDF);
    linkPDF.click();
    linkPDF.remove();
    setLoadingPDF(false);
  };
  //#region filter menu on mobile
  // const [anchorEl, setAnchorEl] = useState(null);
  // const handleClick = event => setAnchorEl(event.currentTarget);
  // const handleClose = () => setAnchorEl(null);
  //#endregion
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
            Relatório de Produção
          </Typography>
          <div>
            <Button className={classes.export} onClick={fnExcelReport}>
              <FontAwesomeIcon icon={faFileExcel} />
              <span>Excel</span>
            </Button>
            <iframe title="frameId" id="frameId" style={{ display: "none" }} />
          </div>
          <div className={classes.exportWrapper}>
            {loadingPDF && (
              <div className={classes.exportLoader}>
                <Loader />
              </div>
            )}
            <Button className={classes.export} onClick={fnPDFReport}>
              <FontAwesomeIcon icon={faFilePdf} />
              <span>PDF</span>
            </Button>
          </div>
          <div style={{ flex: 1 }} />
          <Hidden smDown>
            <MenuFilter
              identity="menu-group-by"
              filter={groupBy}
              setFilter={setGroupBy}
              options={groupByTextMap}
            />
            <MenuFilter
              identity="events-by"
              filter={eventsBy}
              setFilter={setEventsBy}
              options={eventsByTextMap}
            />
          </Hidden>
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
            <Typography variant="body1" className={classes.label}>
              até
            </Typography>
          </Hidden>
          <DateFilter
            isEndDate
            date={endDate}
            setDate={setEndDate}
            minDate={moment(startDate).add(1, "days")}
            maxDate={
              moment(startDate).add(15, "days").isAfter(moment(), "minute")
                ? moment()
                : moment(startDate).add(15, "days")
            }
          />
          <PlantFilter setQuery={setPlantIdQuery} />
        </Toolbar>
      </Grid>
      <Grid item className={classes.wrapper}>
        {loading && (
          <div className={classes.loader}>
            <Loader />
          </div>
        )}
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
              {lodashMap(availabilityData, (item, index) => (
                <React.Fragment key={index}>
                  {groupBy === "mipoi" && (
                    <React.Fragment>
                      {/* TODO add expand transition */}
                      <DataRow
                        header={header}
                        item={item.groupTotal}
                        groupBy={{
                          handleGroupExpand,
                          expandId: lodashGet(item, "machine.id"),
                          expanded: lodashGet(
                            groupByExpandMap,
                            `${lodashGet(item, "machine.id")}`
                          ),
                          enabled: true,
                          colspan: item.colspan,
                          text: `${lodashGet(
                            item,
                            "machine.identity"
                          )} - ${lodashGet(item, "machine.name")}`,
                        }}
                      />
                      {lodashGet(
                        groupByExpandMap,
                        `${lodashGet(item, "machine.id")}`
                      ) &&
                        lodashMap(item.groupData, (item, index) => (
                          <DataRow key={index} header={header} item={item} />
                        ))}
                    </React.Fragment>
                  )}
                  {groupBy === "mi" && (
                    <DataRow header={header} item={item.groupTotal} />
                  )}
                  {groupBy === "poi" && <DataRow header={header} item={item} />}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </Grid>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(ProductionReport);
