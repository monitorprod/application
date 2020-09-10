import React, { useContext, useState, useEffect } from "react";
import moment from "moment";
import {
  Grid,
  Icon,
  Toolbar,
  Hidden
} from "@material-ui/core";
import ApiContext from "../../api";
import {
  MasterDataCard,
  Button,
  Loader
} from "../../components";
import {
  // Link,
  classNames,
  withStyles,
  lodashGet,
  useSensorAllURL,
  getColor,
  getEventType,
  getDateJSON,
  getPermissions,
  useAuth,
  Link
} from "../../utils";
// import IndicatorsReport from "./IndicatorsReport";
import PlantFilter from "./PlantFilter";

const actions = [
  {
    name: "Produção Ativa",
    icon: "view_agenda",
    href: "/dashboard/production",
    permissions: ["readProductionOrders"]
  },
  {
    name: "Apontamento Refugo",
    icon: "vertical_split",
    href: "/dashboard/production-waste",
    permissions: ["readProductionOrders"]
  },
  {
    name: "Histórico de Produção",
    icon: "view_day",
    href: "/dashboard/production-history",
    permissions: ["readProductionOrderReports"]
  },
  {
    name: "Relatório de Produção",
    icon: "table_chart",
    href: "/dashboard/production-report",
    permissions: ["readProductionOrderReports"]
  },
  {
    name: "Tempo Real",
    icon: "av_timer",
    permissions: ["readProductionOrders", "readProductionOrderReports"]
  }
];

const styles = theme => ({
  icon: {
    marginLeft: theme.spacing(1)
  },
  kpiLabel: {
    fontSize: ".75rem"
  },
  toolbar: {
    zIndex: 10,
    width: `calc(100% + ${theme.spacing(6)}px)`,
    margin: -theme.spacing(3),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      margin: -theme.spacing(1),
      width: `calc(100% + ${theme.spacing(2)}px)`
    },
    //color: theme.palette.common.white,
    backgroundColor: theme.palette.secondary.main
  },
  export: {
    minWidth: "auto",
    color: theme.palette.primary.main
  },
  disabled: {
    pointerEvents: "none",
    background: "lightgrey"
  }
});

const DashboardPage = ({ classes }) => {
  const { session, permissions } = useAuth();
  const level = lodashGet(session, "company.level");
  const client = useContext(ApiContext);
  const noJustifiedEventType = getEventType({ client, type: "noJustified" });
  const [inactiveMachines, setInactiveMachines] = useState(0);
  const [pendingWaste, setPendingWaste] = useState(0);
  const [plantIdQuery, setPlantIdQuery] = useState({});
  const [inactiveMachinesLoading, setInactiveMachinesLoading] = useState();
  const [pendingWasteLoading, setPendingWasteLoading] = useState();
  const stringQuery = JSON.stringify(plantIdQuery);
  // TODO usedebounce for EVERYTHNG!
  useEffect(() => {
    // console.log("!!effect getReportLabelsData Inactive");
    const getReportLabelsData = async () => {
      setInactiveMachinesLoading(true);
      const ReportLabelsData = await client.service("machines").find({
        query: {
          ...JSON.parse(stringQuery),
          $reportLabels: {
            type: "inactiveMachines",
            sd: moment()
              .subtract(1, "days")
              .startOf("day")
              .add(6, "hours"),
            ed: moment()
              .subtract(1, "days")
              .endOf("day")
              .add(6, "hours")
          },
          machineStatusId: lodashGet(client.get("config.machine.status.active"), "value")
        }
      });
      setInactiveMachines(ReportLabelsData.inactiveMachines);
      setInactiveMachinesLoading(false);
    };
    getReportLabelsData();
  }, [client, stringQuery]);
  useEffect(() => {
    // console.log("!!effect getReportLabelsData Waste");
    const getReportLabelsData = async () => {
      setPendingWasteLoading(true);
      const ReportLabelsData = await client.service("machines").find({
        query: {
          ...JSON.parse(stringQuery),
          $reportLabels: {
            type: "pendingWaste",
            sd: getDateJSON({
              date: moment()
                .subtract(7, "days")
                .startOf("day")
                .add(6, "hours")
            }),
            ed: getDateJSON({
              date: moment()
                .subtract(1, "days")
                .endOf("day")
                .add(6, "hours")
            })
          },
          machineStatusId: lodashGet(client.get("config.machine.status.active"), "value")
        }
      });
      setPendingWaste(ReportLabelsData.pendingWaste);
      setPendingWasteLoading(false);
    };
    getReportLabelsData();
  }, [client, stringQuery]);
  const noJustifiedColor = getColor({
    data: client.get(`actionType.${noJustifiedEventType}`),
    path: "color"
  });
  const getLinkLabel = ({ index }) => (
    <React.Fragment>
      <span>{lodashGet(actions, `${index}.name`)}</span>
      <Icon className={classes.icon}>arrow_forward_ios</Icon>
    </React.Fragment>
  );
  const { sensorsURL } = useSensorAllURL();
  const hasProductionAccess = getPermissions({
    privileges: [
      "readProductionOrders",
      "writeActiveProductionOrders",
      "writeScheduledStopProductionOrders",
      "writeProductionOrderEvents"
    ],
    permissions
  });
  const hasReportsAccess = getPermissions({
    privileges: ["readProductionOrderReports"],
    permissions
  });
  const hasWasteAccess = getPermissions({
    privileges: ["readPendingWaste", "writePendingWaste", "editPendingWaste"],
    permissions
  });
  return (
    <div className={classes.container}>
      <Toolbar className={classes.toolbar}>
        <div style={{ flex: 1 }} />
        <Hidden smDown>
          <Button
            className={classes.export}
            component={Link}
            to={"/reports/carousel"}
            text="Tela Cheia"
            icon="view_carousel"
            variant="toolbar"
            color='primary'
          />
        </Hidden>
        <PlantFilter setQuery={setPlantIdQuery} />
      </Toolbar>
      <Grid container spacing={2}>
        <Grid item container spacing={2} className={classes.kpi}>
          {hasProductionAccess && (
            <Grid item xs={12} sm={6}>
              <MasterDataCard
                name={getLinkLabel({ index: 0 })}
                description={lodashGet(actions, "0.description")}
                icon={lodashGet(actions, "0.icon")}
                href={lodashGet(actions, "0.href")}
                kpi={
                  <React.Fragment>
                    {inactiveMachinesLoading && <Loader />}
                    {!inactiveMachinesLoading && (
                      <span style={{ color: noJustifiedColor }}>{inactiveMachines}</span>
                    )}
                    <span className={classes.kpiLabel} style={{ color: noJustifiedColor }}>
                      Máquinas paradas
                    </span>
                  </React.Fragment>
                }
              />
            </Grid>
          )}
          {hasWasteAccess && (
            <Grid
              item
              xs={12}
              sm={6}
              className={classNames({ [classes.disabled]: level !== "N1" })}
            >
              <MasterDataCard
                name={getLinkLabel({ index: 1 })}
                description={lodashGet(actions, "1.description")}
                icon={lodashGet(actions, "1.icon")}
                href={lodashGet(actions, "1.href")}
                kpi={
                  level === "N1" && (
                    <React.Fragment>
                      {pendingWasteLoading && <Loader />}
                      {!pendingWasteLoading && (
                        <span style={{ color: noJustifiedColor }}>{pendingWaste}</span>
                      )}
                      <span className={classes.kpiLabel} style={{ color: noJustifiedColor }}>
                        Apontamentos pendentes (7d)
                      </span>
                    </React.Fragment>
                  )
                }
              />
            </Grid>
          )}
          {hasReportsAccess && (
            <Grid item xs={12} sm={6}>
              <MasterDataCard
                name={getLinkLabel({ index: 2 })}
                description={lodashGet(actions, "2.description")}
                icon={lodashGet(actions, "2.icon")}
                href={lodashGet(actions, "2.href")}
              />
            </Grid>
          )}
          {/* {hasReportsAccess && (
            <Grid item xs={12} sm={6}>
              <MasterDataCard
                name={getLinkLabel({ index: 3 })}
                description={lodashGet(actions, "3.description")}
                icon={lodashGet(actions, "3.icon")}
                href={lodashGet(actions, "3.href")}
              />
            </Grid>
          )} */}
          {(hasProductionAccess || hasReportsAccess) && sensorsURL && (
            <Grid item xs={12} sm={6}>
              <a href={sensorsURL} rel="noopener noreferrer" target="_blank">
                <MasterDataCard
                  name={getLinkLabel({ index: 4 })}
                  description={lodashGet(actions, "4.description")}
                  icon={lodashGet(actions, "4.icon")}
                />
              </a>
            </Grid>
          )}
        </Grid>
        {/* {hasReportsAccess && (
          <Grid item container spacing={2}>
            <IndicatorsReport plantIdQuery={plantIdQuery} />
          </Grid>
        )} */}
      </Grid>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(DashboardPage);
