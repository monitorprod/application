import React, { useContext, useEffect, useState } from "react";
import { Grid, Typography, Fab, Hidden, Icon } from "@material-ui/core";
import ApiContext from "../../../../api";
import {
  withRouter,
  withStyles,
  lodashGet,
  // lodashMap,
  // lodashFind,
  lodashDebounce,
  // lodashUpperFirst,
  getPermissions,
  useGetService,
  useAuth
} from "../../../../utils";
import {
  BreadCrumbs,
  Loader,
  Errors,
  FormInput,
  FieldsRow
} from "../../../../components";
import { form as fields } from "./model";
import Actions from "./Actions";
import Status from "./Status";
import Selection from "./Selection";
import useDEFAULT from "./useDEFAULT";
// import useFIXHistory from "./useFIXHistory";
import EventDrawer from "./EventDrawer";

const styles = theme => ({
  container: {
    flexWrap: "nowrap",
    overflow: "hidden",
    maxHeight: "100%",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      padding: "6px"
    }
  },
  wrapper: {
    flex: 1,
    flexWrap: "nowrap",
    overflowY: "auto",
    overflowX: "hidden"
  },
  grid: {
    flex: 1,
    flexWrap: "nowrap"
  },
  formContainer: {
    overflowX: "hidden",
    "&>div": {
      flexWrap: "nowrap"
    }
  },
  message: {
    flex: 1
  },
  events: {
    flex: 1,
    flexWrap: "nowrap",
    [theme.breakpoints.down("sm")]: {
      overflowY: "auto",
      minHeight: 200
    }
  },
  isClosed: {
    color: theme.palette.primary.delete,
    textAlign: "center",
    textTransform: "uppercase"
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    backgroundColor: theme.palette.secondary.main,
    zIndex: 99
  },
  content: {
    display: "flex",
    overflowY: "auto",
    margin: -theme.spacing(3),
    padding: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      margin: -theme.spacing(1),
      padding: theme.spacing(1)
    }
  },
  breadCrumbs: {
    [theme.breakpoints.up("sm")]: {
      marginTop: "20px",
      paddingLeft: "16px"
    }
  },
  inputWrapper: {
    display: "flex"
  },
  deviceURL: {
    textDecoration: "underline",
    cursor: "pointer"
  }
});

const ProductionOrderFormPage = ({ history, match: { params }, classes }) => {
  const { session, permissions } = useAuth();
  const level = lodashGet(session, "company.level");
  const client = useContext(ApiContext);
  const {
    item: productionOrder,
    loading: loadingGet,
    errors: errorsGet,
    reload
  } = useGetService({
    model: "production_orders",
    id: params.productionOrderId,
    query: {
      $eventsAndNavigation: true
    }
  });
  const [machine, setMachine] = useState({});
  const [openDrawer, setOpenDrawer] = useState(false);
  const handleDrawer = () => {
    setOpenDrawer(prev => !prev);
  };
  useEffect(() => {
    // console.log("!!! effect INDEX onNewEvent");
    const onNewEvent = lodashDebounce(() => reload(), 300);
    const onPatched = data => {
      if (`${data.id}` === `${params.productionOrderId}`) {
        onNewEvent();
      }
    };
    client.service("production_orders").on("patched", onPatched);
    return () =>
      client.service("production_orders").removeListener("patched", onPatched);
  }, [client, params.productionOrderId, reload]);
  // TODO add loader for internal operations
  const {
    selectedMachine,
    selectedSensor,
    formItem,
    formErrors,
    handleChange,
    handleSubmit: upsertSubmit,
    loading: loadingUpsert,
    errors: errorsUpsert
  } = useDEFAULT({
    productionOrder,
    machineId: params.machineId,
    history
  });
  useEffect(() => {
    const getMachineNavigation = async () => {
      const machineNavigation = await client
        .service("machines")
        .get(params.machineId, {
          query: {
            $eventsAndNavigation: true
          }
        });
      setMachine(machineNavigation);
    };
    if (params.productionOrderId === "new") {
      getMachineNavigation();
    }
  }, [client, params.machineId, params.productionOrderId]);
  // useFIXHistory({
  //   productionOrderId: params.productionOrderId
  // });
  const errors = errorsGet || errorsUpsert;
  const loading = loadingGet || loadingUpsert;
  const handleSubmit = e => {
    e.preventDefault();
    if (loading) {
      return;
    }
    upsertSubmit(e);
  };
  const hasCRUDAccess = getPermissions({
    privileges: [
      "writeActiveProductionOrders",
      "writeScheduledStopProductionOrders"
    ],
    permissions
  });
  const hasInProductionAccess = getPermissions({
    privileges: ["writeActiveProductionOrders"],
    permissions
  });
  const hasNotInProductionAccess = getPermissions({
    privileges: ["writeScheduledStopProductionOrders"],
    permissions
  });
  const hasEventsAccess = getPermissions({
    privileges: ["writeProductionOrderEvents"],
    permissions
  });
  let productionOrderTypeQuery = {};
  if (hasInProductionAccess && hasNotInProductionAccess) {
    productionOrderTypeQuery = {};
  } else if (hasInProductionAccess) {
    productionOrderTypeQuery.isInProduction = true;
  } else if (hasNotInProductionAccess) {
    productionOrderTypeQuery.isInProduction = false;
  }
  // console.log("!! productionOrder FORM", productionOrder);
  return (
    <div className={classes.content}>
      <Grid container direction="column" spacing={0} className={classes.grid}>
        <Grid item>
          <BreadCrumbs
            links={[
              {
                text: "Produção",
                href: "/dashboard/production"
              },
              {
                text: `${
                  selectedMachine
                    ? `${lodashGet(selectedMachine, "identity")} - ${lodashGet(
                        selectedMachine,
                        "name"
                      )}: `
                    : ""
                }${
                  productionOrder
                    ? `Order ${productionOrder.id}`
                    : "Nova Ordem de Produção"
                }`,
                href: `/dashboard/production/${params.machineId}/order/${params.productionOrderId}`
              }
            ]}
          />
        </Grid>
        <Grid item>
          <Actions
            machine={machine}
            productionOrder={productionOrder}
            handleSubmit={handleSubmit}
          />
        </Grid>
        <Grid item className={classes.wrapper}>
          <Grid
            container
            direction="column"
            className={classes.formContainer}
            spacing={0}
          >
            {lodashGet(productionOrder, "uuid") && (
              <Hidden mdUp>
                <Fab
                  variant="extended"
                  aria-label="Delete"
                  className={classes.fab}
                  onClick={handleDrawer}
                >
                  <Icon>keyboard_arrow_up</Icon>
                  {lodashGet(productionOrder, "isActive")
                    ? "Reportar Evento"
                    : "Iniciar Ordem"}
                </Fab>
              </Hidden>
            )}
            {loading && <Loader />}
            {errors && <Errors errors={errors} />}
            <Grid item container className={classes.container} spacing={2}>
              <Grid item container direction="column" spacing={2}>
                {lodashGet(productionOrder, "isClosed") && (
                  <Grid item>
                    <Typography className={classes.isClosed} variant="body1">
                      Ordem Encerrada
                    </Typography>
                  </Grid>
                )}
                {(lodashGet(productionOrder, "isActive") ||
                  lodashGet(productionOrder, "isClosed")) && (
                  <Status
                    productionOrder={productionOrder}
                    formItem={formItem}
                  />
                )}
                <Grid item className={classes.inputWrapper}>
                  <FormInput
                    field={fields[0]}
                    formItem={formItem}
                    formErrors={formErrors}
                    handleChange={handleChange}
                    query={productionOrderTypeQuery}
                    options={{
                      readOnly: !hasCRUDAccess
                    }}
                    loading={loadingGet}
                  />
                </Grid>
                <Grid item>
                  <FieldsRow
                    fields={fields.slice(1, 2)}
                    formItem={formItem}
                    formErrors={formErrors}
                    handleChange={handleChange}
                    options={{
                      readOnly: !hasCRUDAccess && !hasEventsAccess
                    }}
                    loading={loadingGet}
                  />
                </Grid>
                <Selection
                  field={fields[2]}
                  formItem={formItem}
                  selectedItem={selectedMachine}
                  formErrors={formErrors}
                  handleChange={handleChange}
                  options={{
                    dontDelete: !!lodashGet(productionOrder, "uuid"),
                    readOnly: !hasCRUDAccess
                  }}
                  customContent={{
                    afterSelected: () => {
                      if (!selectedSensor) {
                        return (
                          <Grid item className={classes.message}>
                            <Typography variant="body1">
                              Nenhum leitor registrado para esta máquina.
                            </Typography>
                          </Grid>
                        );
                      }
                      const machineName = `${selectedMachine.identity} - ${selectedMachine.name}`;
                      const machineURL = `http://${
                        selectedSensor.ip
                      }:3030/?name=${window.escape(machineName)}`;
                      return (
                        <div
                          className={classes.deviceURL}
                          onClick={() =>
                            window.open(
                              machineURL,
                              machineName,
                              "width=650,height=350,toolbar=no,menubar=no,scrollbars=yes,resizable=yes,location=no,directories=no,status=no"
                            )
                          }
                        >
                          <Selection
                            field={{ icon: "memory" }}
                            selectedItem={selectedSensor}
                          />
                        </div>
                      );
                    }
                  }}
                />
                <Grid item className={classes.inputWrapper}>
                  <FieldsRow
                    fields={fields[3]}
                    formItem={formItem}
                    formErrors={formErrors}
                    handleChange={handleChange}
                    options={{
                      dontDelete: !!lodashGet(productionOrder, "uuid"),
                      readOnly: !hasCRUDAccess
                    }}
                  />
                </Grid>
                {level === "N1" && (
                  <Grid item className={classes.inputWrapper}>
                    <FieldsRow
                      fields={fields[4]}
                      formItem={formItem}
                      formErrors={formErrors}
                      handleChange={handleChange}
                      options={{
                        dontDelete: !!lodashGet(productionOrder, "uuid"),
                        readOnly: !hasCRUDAccess
                      }}
                    />
                  </Grid>
                )}
                <Grid item>
                  <FieldsRow
                    fields={fields.slice(6, 8)}
                    formItem={formItem}
                    formErrors={formErrors}
                    handleChange={handleChange}
                    options={{
                      readOnly:
                        (!hasCRUDAccess && !hasEventsAccess) ||
                        !!lodashGet(productionOrder, "isClosed")
                    }}
                  />
                </Grid>
                <Grid item>
                  <FieldsRow
                    fields={fields.slice(8, 9)}
                    formItem={formItem}
                    handleChange={handleChange}
                    options={{
                      readOnly:
                        !hasCRUDAccess ||
                        !!lodashGet(productionOrder, "isClosed")
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {hasEventsAccess && lodashGet(productionOrder, "uuid") && (
        <EventDrawer
          handleDrawer={handleDrawer}
          open={openDrawer}
          side="bottom"
          variant="temporary"
          productionOrder={productionOrder}
          eventTypes={lodashGet(productionOrder, "eventTypes")}
          loading={loadingGet}
          reload={reload}
        />
      )}
    </div>
  );
};

export default withRouter(
  withStyles(styles, { withTheme: true })(ProductionOrderFormPage)
);
