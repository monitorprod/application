import React, { useState } from "react";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Grid,
  Icon,
  Typography
} from "@material-ui/core";
import {
  classNames,
  withStyles,
  lodashMap,
  lodashFilter,
  getPermissions,
  useAuth
} from "../../utils";
import MasterDataCard from "../master-data-card";

const styles = theme => ({
  panel: {},
  header: {
    backgroundColor: theme.palette.primary.main,
    "&>div": {
      alignItems: "center"
    }
  },
  gridItem: {
    outline: "solid lightgrey 1px",
    outlineOffset: "-4px"
  },
  disabled: {
    pointerEvents: "none",
    background: "lightgrey"
  },
  icon: {
    marginRight: theme.spacing(1),
    color: "white"
  }
});

const AdministrationPage = withStyles(styles, { withTheme: true })(
  ({ classes, actions }) => {
    const { permissions } = useAuth();
    const [expanded, setExpanded] = useState(0);
    const handleExpand = ({ index }) => () => {
      if (expanded === index) {
        setExpanded();
      } else {
        setExpanded(index);
      }
    };
    return (
      <React.Fragment>
        {lodashMap(
          lodashFilter(
            actions,
            group =>
              !group.permissions ||
              getPermissions({ privileges: group.permissions, permissions })
          ),
          ({ name, icon, svgIcon, actions }, index) => (
            <ExpansionPanel
              key={name}
              className={classes.panel}
              expanded={expanded === index}
              onChange={handleExpand({ index })}
            >
              <ExpansionPanelSummary
                className={classes.header}
                expandIcon={
                  <Icon style={{ color: "white" }}>expand_more_icon</Icon>
                }
              >
                {!svgIcon && icon && (
                  <Icon className={classes.icon}>{icon}</Icon>
                )}
                {svgIcon}
                <Typography variant="h5" style={{ color: "white" }}>
                  {name}
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <Grid container spacing={1}>
                  {lodashMap(
                    lodashFilter(
                      actions,
                      action =>
                        !action.permissions ||
                        getPermissions({
                          privileges: action.permissions,
                          permissions
                        })
                    ),
                    ({ name, description, href, disabled }) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        lg={4}
                        key={name}
                        className={classNames(classes.gridItem, {
                          [classes.disabled]: disabled
                        })}
                      >
                        <MasterDataCard
                          name={name}
                          description={description}
                          href={href}
                        />
                      </Grid>
                    )
                  )}
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          )
        )}
      </React.Fragment>
    );
  }
);

const withAdministrationPage = ({ actions }) => (
  <AdministrationPage actions={actions} />
);

export default withAdministrationPage;
