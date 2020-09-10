import React from "react";
import { Grid, Button, Icon } from "@material-ui/core";
import { Link, withStyles, classNames, lodashMap } from "../../utils";

const styles = theme => ({
  grid: {
    minHeight: 64,
    zIndex: 10,
    width: `calc(100% + ${theme.spacing(6)}px)`,
    margin: -theme.spacing(3),
    marginBottom: theme.spacing(2),
    padding: `0 ${theme.spacing(3)}px`,
    backgroundColor: theme.palette.secondary.main,
    [theme.breakpoints.down("xs")]: {
      margin: -theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: `calc(100% + ${theme.spacing(2)}px)`,
      padding: `0 ${theme.spacing(1)}px`,
      minHeight: 56
    }
  },
  link: {
    "& a": {
      minHeight: 0
    }
  },
  firstLink: {
    "& a": {
      paddingLeft: 0
    }
  },
  wrapper: {
    display: "flex",
    color: '#000000de',
  },
  arrow: {
    fontSize: "1.25rem"
  },
  button: {
    color: '#000000de',
  }
});

const BreadCrumbs = ({ classes, links }) => (
  <Grid container alignItems="center" className={classes.grid}>
    {lodashMap(links, ({ text, href }, index) => (
      <React.Fragment key={index}>
        {index !== 0 && (
          <Grid item className={classes.wrapper}>
            <Icon className={classes.arrow}>arrow_forward_ios</Icon>
          </Grid>
        )}
        <Grid
          item
          className={classNames(classes.link, {
            [classes.firstLink]: index === 0
          })}
        >
          {href ? (
            <Button className={classes.button} component={Link } to={href}>
              {text}
            </Button>
          ) : (
            <Button className={classes.button} >{text}</Button>
          )}
        </Grid>
      </React.Fragment>
    ))}
  </Grid>
);

export default withStyles(styles, { withTheme: true })(BreadCrumbs);
