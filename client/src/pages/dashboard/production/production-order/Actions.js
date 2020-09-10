import React from "react";
import { Grid } from "@material-ui/core";
import {
  Link,
  withRouter,
  withStyles,
  classNames,
  lodashGet,
  getPermissions,
  useAuth
} from "../../../../utils";
import { Button } from "../../../../components";

const styles = theme => ({
  container: {
    marginBottom: theme.spacing(2)
  },
  isActive: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white
  },
  navigation: {
    color: theme.palette.common.black,
    padding: 0
  }
});

const Actions = ({
  history,
  match: { params },
  classes,
  machine,
  productionOrder,
  handleSubmit
}) => {
  const { session, permissions } = useAuth();
  const level = lodashGet(session, "company.level");
  // TODO stringify ALL to avoid infinity cycles
  const handleCopy = () => {
    const copyItem = { ...productionOrder };
    delete copyItem.id;
    delete copyItem.uuid;
    delete copyItem.totalProduction;
    delete copyItem.confirmedProduction;
    delete copyItem.wastedProduction;
    delete copyItem.actualStartDate;
    delete copyItem.actualEndDate;
    localStorage.setItem(
      "copy-production-order",
      JSON.stringify({ ...copyItem })
    );
    // TODO remove all redirects
    history.push(`/dashboard/production/${params.machineId}/order/new`);
  };
  const hasCRUDAccess = getPermissions({
    privileges: [
      "writeActiveProductionOrders",
      "writeScheduledStopProductionOrders",
      "writeProductionOrderEvents"
    ],
    permissions
  });
  const prevProductionOrder =
    lodashGet(productionOrder, "prevProductionOrder.id") ||
    lodashGet(machine, "prevProductionOrder.id");
  const prevProductionOrderProps = {};
  if (prevProductionOrder) {
    prevProductionOrderProps.component = Link;
    prevProductionOrderProps.to = `/dashboard/production/${params.machineId}/order/${prevProductionOrder}`;
  }
  const nextProductionOrder =
    lodashGet(productionOrder, "nextProductionOrder.id") ||
    lodashGet(machine, "nextProductionOrder.id");
  const nextProductionOrderProps = {};
  if (nextProductionOrder) {
    nextProductionOrderProps.component = Link;
    nextProductionOrderProps.to = `/dashboard/production/${params.machineId}/order/${nextProductionOrder}`;
  }
  const activeProductionOrder =
    lodashGet(productionOrder, "activeProductionOrder.id") ||
    lodashGet(machine, "activeProductionOrder.id");
  const activeProductionOrderProps = {};
  if (activeProductionOrder) {
    activeProductionOrderProps.component = Link;
    activeProductionOrderProps.to = `/dashboard/production/${params.machineId}/order/${activeProductionOrder}`;
  }
  return (
    <Grid
      item
      container
      spacing={1}
      direction="row"
      justify="flex-start"
      alignItems="center"
      className={classes.container}
    >
      {hasCRUDAccess && (
        <Grid item>
          <Button
            type="submit"
            text="Gravar"
            icon="save"
            variants="submit"
            onClick={handleSubmit}
          />
        </Grid>
      )}
      <Grid item>
        <Button
          className={classes.navigation}
          type="icon"
          text="Ordem Anterior"
          icon="arrow_back_ios"
          disabled={!prevProductionOrder}
          {...prevProductionOrderProps}
        />
      </Grid>
      <Grid item>
        <Button
          className={classNames({
            [classes.isActive]:
              `${activeProductionOrder}` === `${params.productionOrderId}`
          })}
          text="Ativa"
          icon="center_focus_strong"
          disabled={!activeProductionOrder}
          {...activeProductionOrderProps}
        />
      </Grid>
      <Grid item>
        <Button
          className={classes.navigation}
          type="icon"
          text="Próxima Ordem"
          icon="arrow_forward_ios"
          disabled={!nextProductionOrder}
          {...nextProductionOrderProps}
        />
      </Grid>
      {hasCRUDAccess && lodashGet(productionOrder, "uuid") && level === "N1" && (
        <Grid item>
          <Button
            text="Criar Nova"
            icon="add"
            component={Link}
            to={`/dashboard/production/${params.machineId}/order/new`}
          />
        </Grid>
      )}
      {hasCRUDAccess && lodashGet(productionOrder, "uuid") && (
        <Grid item>
          <Button
            text="Criar como Copia"
            icon="file_copy"
            onClick={handleCopy}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(Actions));
