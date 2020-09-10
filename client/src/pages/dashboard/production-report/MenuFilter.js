import React, { useRef, useState } from "react";
import {
  Button,
  Icon,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem
} from "@material-ui/core";
import { withStyles, lodashMap } from "../../../utils";

const styles = theme => ({
  filter: {
    backgroundColor: "rgba(255, 255, 255, .15)",
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(1),
    borderRadius: 50,
    [theme.breakpoints.down("xs")]: {
      margin: 3,
      padding: 2
    }
  },
  item: {
    textTransform: "uppercase"
  }
});

const MenuFilter = ({ classes, filter, setFilter, identity, options }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const handleToggle = () => {
    setOpen(prev => !prev);
  };
  const handleClose = event => {
    if (menuRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };
  const handleSelect = ({ key }) => () => {
    setFilter(key);
    setOpen(false);
  };
  return (
    <React.Fragment>
      <div className={classes.filter}>
        <Button
          buttonRef={node => {
            menuRef.current = node;
          }}
          aria-owns={open ? identity : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <span>{options[filter]}</span>
        </Button>
      </div>
      {/* TODO use menu as filters menu, without so many wrappers */}
      <Popper open={open} anchorEl={menuRef.current} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            id={identity}
            style={{
              transformOrigin: placement === "bottom" ? "center top" : "center bottom"
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {lodashMap(options, (text, key) => (
                    <MenuItem className={classes.item} key={key} onClick={handleSelect({ key })}>
                      {text}
                      {filter === key && <Icon>done</Icon>}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(MenuFilter);
