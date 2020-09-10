import React, { useContext, useState } from "react";
import { Grid, Typography, Toolbar } from "@material-ui/core";
import moment from "moment";
import ApiContext from "../../../api";
import {
  withStyles,
  lodashGet,
  lodashMap,
  useFindService,
  getColor,
  useAuth
} from "../../../utils";
import { NotFound, Loader, Errors } from "../../../components";
import PlantFilter from "../PlantFilter";
import ProductionOrderCard from "./ProductionOrderCard";

const styles = theme => ({
  alert: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "&>div": {
      width: 20,
      height: 20,
      marginRight: 10
    }
  },
  scrollArea: {
    height: "100%"
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
    color: theme.palette.common.white,
    backgroundColor: theme.palette.secondary.main
  }
});

const ProductionPage = ({ classes, limit, offset }) => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  const client = useContext(ApiContext);
  const [showUndefinedAlert, setShowUndefinedAlert] = useState();
  const [showStoppedAlert, setShowStoppedAlert] = useState();
  const [showNoActiveOPAlert, setShowNoActiveOPAlert] = useState();
  const [showMaxProductionAlert, setShowMaxProductionAlert] = useState();
  const { list, loading, errors, setQuery: setFindQuery } = useFindService({
    model: "machines",
    query: {
      $productionOrders: {
        sd: moment()
          .startOf("day")
          .add(6, "hours")
          .toDate()
      },
      machineStatusId: lodashGet(
        client.get("config.machine.status.active"),
        "value"
      ),
      $sort: { identity: 1 },
      $limit: limit,
      $skip: offset
    }
  });
  const empty = !loading && !errors && list.length === 0;
  const noJustifiedColor = client.get(
    `actionType.${lodashGet(
      client.get("config.productionOrder.eventType.noJustified"),
      "value"
    )}`
  );
  return (
    <div className={classes.container}>
      <Toolbar className={classes.toolbar}>
        <div style={{ flex: 1 }} />
        <PlantFilter setFindQuery={setFindQuery} />
      </Toolbar>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {loading && <Loader />}
          {errors && <Errors errors={errors} />}
          {empty && <NotFound />}
          {showUndefinedAlert && (
            <div className={classes.alert}>
              <div
                style={{
                  background: "rgba(0, 0, 0, .14)"
                }}
              />
              <Typography>
                Máquinas sem comunicação com o leitor com ciclos no dia de hoje.
              </Typography>
            </div>
          )}
          {showStoppedAlert && (
            <div className={classes.alert}>
              <div
                style={{
                  background: getColor({
                    data: noJustifiedColor,
                    path: "color"
                  })
                }}
              />
              <Typography>
                Máquinas paradas com ciclos no leitor no dia de hoje.
              </Typography>
            </div>
          )}
          {showNoActiveOPAlert && (
            <div className={classes.alert}>
              <div
                style={{
                  background: "#00BFFF"
                }}
              />
              <Typography>
                Máquinas sem OP ativa com ciclos no leitor no dia de hoje.
              </Typography>
            </div>
          )}
          {showMaxProductionAlert && level === "N1" && (
            <div className={classes.alert}>
              <div
                style={{
                  background: "#ADFF2F"
                }}
              />
              <Typography>Produção esperada excedida.</Typography>
            </div>
          )}
        </Grid>
        {!empty &&
          lodashMap(list, (machine, index) => (
            <ProductionOrderCard
              key={machine.id}
              index={index}
              machine={machine}
              productionOrder={machine.productionOrder}
              lastEvent={machine.events}
              setShowUndefinedAlert={setShowUndefinedAlert}
              setShowStoppedAlert={setShowStoppedAlert}
              setShowNoActiveOPAlert={setShowNoActiveOPAlert}
              setShowMaxProductionAlert={setShowMaxProductionAlert}
            />
          ))}
      </Grid>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(ProductionPage);
