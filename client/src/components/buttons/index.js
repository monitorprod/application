import React from "react";
import { Tooltip, Button, IconButton, Icon, Hidden, Avatar } from "@material-ui/core";
import { withStyles, classNames, lodashMap, lodashSplit } from "../../utils";

const styles = theme => ({
  button: {},
  navbar: {
    marginRight: theme.spacing(2),
    color: "inherit"
  },
  profile: {
    backgroundColor: "unset",
    color: theme.palette.common.white,
    boxShadow: "none"
  },
  header: {
    borderRadius: 4,
    padding: `0 !important`,
    margin: `0 0 0 ${theme.spacing(1)}px`,
    fontSize: ".75rem",
    "& button, & a": {
      padding: `0 ${theme.spacing(1)}px !important`,
      margin: "0 !important"
    }
  },
  toolbar: {
    minHeight: "unset",
    padding: `${theme.spacing(1 / 2)}px ${theme.spacing(1)}px`
  },
  table: {
    borderRadius: 4,
    minHeight: "unset",
    backgroundColor: theme.palette.secondary.main,  
    "& span":{
      color: "black !important",
    }
    // backgroundColor: "unset"
  },
  lowercase: {
    textTransform: "lowercase !important"
  },
  icon: {
    marginRight: theme.spacing(1)
  },
  submit: {
    borderRadius: 4,
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.common.black
  },
  delete: {
    borderRadius: 4,
    backgroundColor: theme.palette.primary.delete,
    color: theme.palette.common.white
  },
  editAction: {
    color: theme.palette.primary.main
  },
  deleteAction: {
    color: theme.palette.primary.delete
  },
  clearAction: {
    position: "absolute",
    right: 0,
    bottom: 0
  },
  chatSupport: {
    marginRight: theme.spacing(1),
    marginTop: '3px',
    color: "inherit"
  }
});

const FormButton = ({
  classes,
  text,
  icon,
  avatar,
  type = "button",
  variants = "",
  fullWidth = false,
  onClick = () => {},
  ...props
}) => {
  // console.log(">>> render FormButton");
  const Component = type === "icon" ? IconButton : Button;
  const buttonProps = {};
  if (fullWidth) {
    buttonProps.fullWidth = true;
  }
  return (
    <Tooltip
      className={classNames(lodashMap(lodashSplit(variants, " "), key => classes[key]))}
      title={type === "icon" ? text : ""}
    >
      <div>
        <Component
          type={type && type !== "icon" ? type : "button"}
          aria-label={text}
          variant="contained"
          className={classNames(
            classes.button,
            lodashMap(lodashSplit(variants, " "), key => classes[key])
          )}
          onClick={onClick}
          {...buttonProps}
          {...props}
        >
          {icon && (
            <React.Fragment>
              <Hidden mdUp>
                <Icon className={classes.lowercase}>{icon}</Icon>
              </Hidden>
              <Hidden smDown>
                <Icon
                  className={classNames(classes.lowercase, { [classes.icon]: type !== "icon" })}
                >
                  {icon}
                </Icon>
                {type !== "icon" && text}
              </Hidden>
            </React.Fragment>
          )}
          {!icon && type !== "icon" && text}
          {avatar && (
            <Avatar style={{ width: "24px", height: "24px", background: "none" }}>{avatar}</Avatar>
          )}
        </Component>
      </div>
    </Tooltip>
  );
};

export default withStyles(styles, { withTheme: true })(FormButton);
