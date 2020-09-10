import React, { useRef } from "react";
import { Popper, Paper, MenuItem, Avatar, Icon, Typography } from "@material-ui/core";
import { withStyles, lodashMap } from "../../utils";
import NotFound from "../not-found";

const styles = theme => ({
  popper: {
    zIndex: 10,
    minWidth: 300
  },
  menu: {
    marginTop: theme.spacing(1),
    minWidth: 300
  },
  avatar: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  }
});

const FormMenu = ({
  classes,
  field,
  options,
  getItemProps,
  clearSelection,
  open,
  value,
  inputValue,
  loading,
  errors
}) => {
  const empty = (!loading && options.length === 0) || errors;
  const PopperRef = useRef(null);
  return (
    <Popper open={open} anchorEl={PopperRef.current} className={classes.popper}>
      <Paper
        square
        style={{
          width: PopperRef.current ? PopperRef.current.clientWidth : null
        }}
        className={classes.menu}
      >
        {empty && (
          <MenuItem disabled>
            <NotFound />
          </MenuItem>
        )}
        {!empty && (!!inputValue || !loading) && (
          <React.Fragment>
            <MenuItem {...getItemProps({ item: null })} onClick={clearSelection}>
              Remover seleção.
            </MenuItem>
            {lodashMap(options, item => (
              <MenuItem
                {...getItemProps({ item })}
                key={item.id}
                value={item.id}
                selected={value === item.id}
              >
                {/** TODO support custom select render */}
                {item.image && (
                  <Avatar alt={item.name} src={item.image} className={classes.avatar} />
                )}
                {!item.image && field.icon && <Icon className={classes.avatar}>{field.icon}</Icon>}
                <Typography variant="body1">
                  {item.identity ? `${item.identity} - ` : ""}
                  {item.name}
                </Typography>
              </MenuItem>
            ))}
          </React.Fragment>
        )}
      </Paper>
    </Popper>
  );
};

export default withStyles(styles, { withTheme: true })(FormMenu);
