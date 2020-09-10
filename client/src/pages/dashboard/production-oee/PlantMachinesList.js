import React, { useContext } from "react";
import { Typography, Grid, Icon, Avatar } from "@material-ui/core";
import ApiContext from "../../../api";
import {
  Link,
  withRouter,
  withStyles,
  classNames,
  lodashGet,
  lodashMap,
  useFindService
} from "../../../utils";
import { Loader, NotFound } from "../../../components";

const styles = theme => ({
  card: {
    color: theme.palette.common.black,
    display: "flex",
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  link: {
    // TODO do all !important are needed?
    textDecoration: "none"
  },
  selected: {
    backgroundColor: theme.palette.primary.header
  },
  avatar: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  },
  item: {
    flexWrap: "nowrap"
  }
});

const PlantMachinesList = ({ match: { params }, classes, model, plant }) => {
  const client = useContext(ApiContext);
  const { list, loading } = useFindService({
    model: "machines",
    query: {
      plantId: plant.id,
      machineStatusId: lodashGet(client.get("config.machine.status.active"), "value"),
      $sort: {
        identity: 1
      }
    }
  });
  const empty = !loading && !list.length;
  return (
    <React.Fragment>
      {empty && <NotFound />}
      {loading && <Loader />}
      {lodashMap(list, machine => (
        <Grid
          item
          xs={12}
          key={machine.id}
          className={classNames(classes.link, {
            [classes.selected]:
              parseInt(params.plantId, "10") === plant.id &&
              parseInt(params.machineId, "10") === machine.id
          })}
          component={Link}
          to={`${model.formPath}/${plant.id}/machine/${machine.id}`}
        >
          <div className={classes.card}>
            <Grid container alignItems="center" className={classes.item}>
              {machine.image && (
                <Avatar alt={machine.name} src={machine.image} className={classes.avatar} />
              )}
              {!machine.image && model.icon && <Icon className={classes.avatar}>{model.icon}</Icon>}
              <Typography variant="body1">
                {machine.identity ? `${machine.identity} - ` : ""} {machine.name}
              </Typography>
            </Grid>
          </div>
        </Grid>
      ))}
    </React.Fragment>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(PlantMachinesList));
