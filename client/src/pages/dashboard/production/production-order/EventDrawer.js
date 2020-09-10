import React, { useContext, useState } from "react";
import moment from "moment";
import {
  Drawer,
  Toolbar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Icon,
  Typography,
  Hidden
} from "@material-ui/core";
import ApiContext from "../../../../api";
import {
  withStyles,
  lodashGet,
  lodashMap,
  lodashFilter,
  lodashToLower,
  getColor
} from "../../../../utils";
import { Errors, Loader } from "../../../../components";

const styles = theme => ({
  container: {
    height: " calc(100% - 70px)",
    overflow: "overlay",
    minHeight: "300px"
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
    width: "300px",
    right: "0px",
    margin: -theme.spacing(3),
    marginLeft: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      margin: -theme.spacing(1),
      marginLeft: theme.spacing(1)
    }
  },
  drawer: {
    [theme.breakpoints.up("md")]: {
      "&>div": {
        width: 300
      }
    }
  },
  toolbar: {
    backgroundColor: theme.palette.primary.main,
    "& span,& p": { color: theme.palette.common.white }
  },
  list: {
    padding: 0
  },
  item: {
    cursor: "pointer",
    "& span,& p": { color: theme.palette.common.white }
  },
  itemIcon: {
    marginRight: 0
  }
});

const EventDrawer = ({
  classes,
  side,
  open,
  variant,
  productionOrder,
  eventTypes,
  loading,
  reload,
  handleDrawer = () => {}
}) => {
  const client = useContext(ApiContext);
  const [errors, setErrors] = useState();
  const [eventLoading, setEventLoading] = useState();
  const sendEvent = ({ id }) => async () => {
    setErrors();
    setEventLoading(true);
    if (!lodashGet(productionOrder, "isActive")) {
      const { data } = await client.service("production_orders").find({
        query: {
          machineId: lodashGet(productionOrder, "machineId"),
          isActive: true
        }
      });
      if (data.length) {
        setEventLoading(false);
        return setErrors(
          "Existe uma Ordem de Produção já ativa. Por favor, feche-a antes de abrir uma nova."
        );
      }
    }
    if (lodashGet(productionOrder, "moldId") && !lodashGet(productionOrder, "isActive")) {
      const { data } = await client.service("production_orders").find({
        query: {
          moldId: lodashGet(productionOrder, "moldId"),
          isActive: true
        }
      });
      if (data.length) {
        setEventLoading(false);
        return setErrors(
          "Existe uma Ordem de Produção para o Molde selecionado já ativa. Por favor, feche-a antes de abrir uma nova."
        );
      }
    }
    try {
      await client.service("production_order_events").create({
        productionOrderId: productionOrder.id,
        startDate: moment().toISOString(),
        endDate: -1,
        productionOrderEventTypeId: id
      });
      reload();
      handleDrawer();
    } catch (error) {
      setErrors(error.message);
    } finally {
      setEventLoading(false);
    }
  };
  const events = lodashFilter(
    eventTypes,
    item => lodashGet(item, "production_order_action_type.isSystemEvent") === null
  );
  const designedStatus = lodashGet(client.get("config.productionOrder.status.designed"), "value");
  const designed =
    `${lodashGet(productionOrder, "productionOrderStatusId")}` === `${designedStatus}`;
  const listContent = (
    <React.Fragment>
      <Toolbar className={classes.toolbar}>
        <Hidden mdUp>
          <IconButton onClick={handleDrawer} style={{ marginRight: "15px" }}>
            <Icon>keyboard_arrow_down</Icon>
          </IconButton>
        </Hidden>
        <div>
          {designed && (
            <Typography variant="body1">
              Libere a Ordem de Produção para mostrar Eventos.
            </Typography>
          )}
          {!designed && (
            <Typography variant="body1">
              {lodashGet(productionOrder, "isActive")
                ? "Reportar Evento"
                : "Iniciar Ordem de Produção"}
            </Typography>
          )}
        </div>
      </Toolbar>
      <Divider />
      <div className={classes.container}>
        <div hideTracksWhenNotNeeded style={{ width: "100%", minHeight: "300px", overflow:'overlay' }}>
          {errors && <Errors errors={errors} />}
          {(loading || eventLoading) && <Loader />}
          <List className={classes.list}>
            {!designed &&
              !loading &&
              lodashMap(events, ({ id, name, icon }, index) => (
                <React.Fragment key={id}>
                  <ListItem
                    className={classes.item}
                    onClick={sendEvent({ id })}
                    style={{
                      backgroundColor: getColor({
                        data: events,
                        path: `${index}.production_order_action_type.color`
                      })
                    }}
                  >
                    <ListItemIcon>
                      <Icon>{lodashToLower(icon)}</Icon>
                    </ListItemIcon>
                    <ListItemText primary={<Typography>{name}</Typography>} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
          </List>
        </div>
      </div>
    </React.Fragment>
  );
  return (
    <React.Fragment>
      <Hidden smDown>
        <div className={classes.sidebar}>{listContent}</div>
      </Hidden>
      <Hidden mdUp>
        <Drawer open={open} anchor={side} variant={variant} className={classes.drawer}>
          {listContent}
        </Drawer>
      </Hidden>
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(EventDrawer);
