import React from "react";
import { Card, CardActionArea, CardContent, Typography, Icon } from "@material-ui/core";
import { Link, withStyles, lodashIsNil } from "../../utils";

const styles = theme => ({
  card: {
    height: "100%",
    width: "100%",
    textDecoration: "none",
    boxShadow: "none",
    background: "none"
  },
  title: {
    display: "flex",
    alignItems: "center"
  },
  area: {
    height: "100%",
    width: "100%",
    position: "relative",
    paddingLeft: theme.spacing(3),
    display: "flex",
    justifyContent: "left"
  },
  kpi: {
    fontSize: "1.5rem",
    position: "absolute",
    right: 30,
    bottom: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      position: "static",
      flexDirection: "row",
      fontSize: "1rem",
      "& > span:first-of-type": {
        order: 1,
        marginLeft: theme.spacing(1)
      }
    }
  },
  icon: {
    height: 50,
    width: 50,
    fontSize: 50,
    color: theme.palette.type === "dark"? theme.palette.common.white : theme.palette.primary.main
  }
});

const MasterDataCard = ({ classes, name, icon, svgIcon, description, href, kpi }) => {
  const linkProps = {};
  if (href) {
    linkProps.component = Link;
    linkProps.to = href;
  }
  return (
    <Card className={classes.card} {...linkProps}>
      <CardActionArea className={classes.area}>
        {icon && icon.type === "svg" && <img className={classes.icon} alt="icon" src={icon.src} />}
        {icon && !icon.type && <Icon className={classes.icon}>{icon}</Icon>}
        {svgIcon}
        <CardContent>
          <Typography className={classes.title} variant="h5">
            {name}
          </Typography>
          <Typography component="p">{description}</Typography>
          {!lodashIsNil(kpi) && <div className={classes.kpi}>{kpi}</div>}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
export default withStyles(styles, { withTheme: true })(MasterDataCard);
