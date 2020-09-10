import React, { useState } from "react";
import { Grid, Icon, Toolbar, Hidden } from "@material-ui/core";
import { MasterDataCard, Button } from "../../components";
import { Link, withStyles, lodashGet, getPermissions, useAuth } from "../../utils";
import IndicatorsReport from "./IndicatorsReport";
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
    href: "/reports/production-report",
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
  const { permissions } = useAuth();
  const [plantIdQuery, setPlantIdQuery] = useState({});
  const getLinkLabel = ({ index }) => (
    <React.Fragment>
      <span>{lodashGet(actions, `${index}.name`)}</span>
      <Icon className={classes.icon}>arrow_forward_ios</Icon>
    </React.Fragment>
  );
  const hasReportsAccess = getPermissions({
    privileges: ["readProductionOrderReports"],
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
          {hasReportsAccess && (
            <Grid item xs={12} sm={6}>
              <MasterDataCard
                name={getLinkLabel({ index: 3 })}
                description={lodashGet(actions, "3.description")}
                icon={lodashGet(actions, "3.icon")}
                href={lodashGet(actions, "3.href")}
              />
            </Grid>
          )}
        </Grid>
        {hasReportsAccess && (
          <Grid item container spacing={2}>
            <IndicatorsReport plantIdQuery={plantIdQuery} />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(DashboardPage);
