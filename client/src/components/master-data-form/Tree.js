import React, { useState, useEffect } from "react";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
  Avatar,
  Icon,
  Typography
} from "@material-ui/core";
import {
  Link,
  withRouter,
  withStyles,
  classNames,
  lodashGet,
  lodashMap,
  useFindService
} from "../../utils";
import moment from 'moment';
import NotFound from "../not-found";
import Loader from "../loader";
import Errors from "../errors";

const styles = theme => ({
  panel: {
    boxShadow: "none",
    backgroundColor: "unset"
  },
  header: {
    padding: 0,
    minHeight: "unset !important",
    "&>div": {
      margin: "0 !important"
    }
  },
  details: {
    padding: "0 !important",
    flexDirection: "column",
    flexWrap: "nowrap"
  },
  card: {
    color: theme.palette.type === "dark" ?  theme.palette.common.white : theme.palette.common.black,
    flexWrap: "nowrap",
    textDecoration: "none",
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    paddingLeft: ({ deep = 0 }) => `${theme.spacing(2 * (deep + 1))}px`
  },
  selected: {
    backgroundColor: theme.palette.primary.form
  },
  avatar: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  }
});

// TODO move this file to its own folder
const Tree = ({
  match: { params },
  classes,
  model,
  query = {},
  deep = 0,
  reload: propsReload,
  reloadTree,
  customContent = {},
  options = {}
}) => {
  const { list, loading, errors, reload } = useFindService({
    model: model.name,
    query: { $sort: { name: 1 }, ...query }
  });
  // TODO why is Tree reloading when clicking on an item
  useEffect(() => {
    // console.log("!!effect Tree propsReload", propsReload);
    reload(propsReload);
  }, [reload, propsReload]);
  const empty = !loading && !errors && list.length === 0;
  const paramsId = lodashGet(params, model.paramsProp);
  const [expandRef, setExpandRef] = useState({
    [paramsId]: true
  });
  const handleExpand = ({ id }) => () => setExpandRef(prev => ({ ...prev, [id]: !prev[id] }));
  // console.log("!!! TREE render", deep, lodashGet(list, "0.name"));
  return (
    <Grid container direction="column">
      {loading && <Loader />}
      {errors && <Errors errors={errors} />}
      {!options.dontShowNotFound && empty && <NotFound />}
      {!loading && (
        <Grid container spacing={1}>
          {customContent.beforeTree && (
            <Grid item xs={12}>
              {customContent.beforeTree()}
            </Grid>
          )}
          {lodashMap(list, item => {
            const isSelected = parseInt(paramsId, "10") === item.id;
            const linkProps = {};
            if (!options.dontTreeItemLink) {
              linkProps.component = Link;
              linkProps.to = `${model.formPath}/${item.id}`;
            }
            return (
              <Grid key={item.id} item xs={12}>
                <ExpansionPanel
                  className={classes.panel}
                  expanded={expandRef[item.id]}
                  onChange={handleExpand({ id: item.id })}//TODO: this is causing an error on console (it is really necessary????)
                >
                  <ExpansionPanelSummary
                    className={classNames(classes.header, {
                      [classes.selected]: isSelected
                    })}
                    expandIcon={customContent.afterTreeItem && <Icon>expand_more_icon</Icon>}
                  >
                    <Grid container alignItems="center" className={classes.card} {...linkProps}>
                      {item.image && (
                        <Avatar alt={item.name} src={item.image} className={classes.avatar} />
                      )}
                      {!item.image && model.icon && model.icon.type === "svg" && (
                        <img className={classes.avatar} alt="icon" src={model.icon.src} />
                      )}
                      {!item.image && model.icon && !model.icon.type && (
                        <Icon className={classes.avatar}>{model.icon}</Icon>
                      )}
                      {!customContent.customTreeName && (
                        <Typography variant="body1">
                          {item.identity ? `${item.identity} - ` : ""}
                          {item.name}
                        </Typography>
                      )}
                      {customContent.customTreeName && (
                        <Typography variant="body1">
                          {customContent.customTreeName({ data: item })}
                        </Typography>
                      )}
                      {customContent.customName && (
                        <Typography variant="body1">
                          {customContent.customName({ data: item })}
                        </Typography>
                      )}
                      {customContent.customTree && (
                        <Grid item>
                          {customContent.customTree({ data: item })}
                        </Grid>
                      )}
                    </Grid>
                  </ExpansionPanelSummary>
                  {customContent.afterTreeItem && (
                    <ExpansionPanelDetails className={classes.details}>
                      {customContent.afterTreeItem({
                        data: item,
                        reloadTree
                      })}
                    </ExpansionPanelDetails>
                  )}
                </ExpansionPanel>
              </Grid>
            );
          })}
        </Grid>
      )}
      {customContent.afterTree && <div>{customContent.afterTree({ reloadTree })}</div>}
    </Grid>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(Tree));
