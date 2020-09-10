import React, { useContext, useState, useEffect } from "react";
import { Icon, Button, Menu, MenuItem, Typography } from "@material-ui/core";
import ApiContext from "../../api";
import { withStyles, lodashGet, lodashMap, lodashFilter, useFindService } from "../../utils";

const styles = theme => ({
  menu: {
    height: 300
  },
  icon: {
    //color: theme.palette.common.white
  },
  filter: {
    //backgroundColor: "rgba(255, 255, 255, .15)",
    // color: theme.palette.common.black,
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(1),
    borderRadius: 50,
    [theme.breakpoints.down("xs")]: {
      margin: 3,
      padding: 2
    }
  }
});

const PlantFilter = ({ classes, setQuery = () => {}, setFindQuery = () => {}, timeCarousel }) => {
  const client = useContext(ApiContext);
  const [text, setText] = useState("TODAS");
  const [selected, setSelected] = useState({});
  const [firstUpdate, setFirstUpdate] = useState(true);
  const { list, loading } = useFindService({
    model: "plants",
    query: {
      $sort: { name: 1 },
      plantStatusId: lodashGet(client.get("config.plant.status.active"), "value")
    },
    timeCarousel
  });
  const [anchor, setAnchor] = useState(null);
  const handleClick = e => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);
  const handleSelect = ({ id, name }) => () => {
    setSelected(prev => {
      if (prev[id]) {
        delete prev[id];
      } else {
        prev[id] = true;
      }
      return prev;
    });
    handleClose();
  };
  const clearSelection = () => {
    setSelected({});
    handleClose();
  };
  const selectedString = JSON.stringify(selected);
  useEffect(() => {
    const parsedSelected = JSON.parse(selectedString);
    if (loading) {
      return;
    }
    if (firstUpdate) {
      return setFirstUpdate(false);
    }
    const values = Object.keys(parsedSelected);
    if (values.length) {
      setText(
        lodashMap(lodashFilter(list, item => parsedSelected[item.id]), item => item.name).join(", ")
      );
      setFindQuery(prev => ({
        ...prev,
        plantId: {
          $in: values
        }
      }));
      setQuery({
        plantId: {
          $in: values
        }
      });
    } else {
      setText("TODAS");
      setFindQuery(prev => {
        delete prev.plantId;
        return { ...prev };
      });
      setQuery({});
    }
    // TODO add companyUUID to localStorage items
    localStorage.setItem("plant-filters", JSON.stringify(parsedSelected));
  }, [selectedString, loading, firstUpdate, list, setFindQuery, setQuery]);
  const copyFilter = localStorage.getItem("plant-filters");
  useEffect(() => {
    if (copyFilter) {
      setSelected(JSON.parse(copyFilter));
    }
  }, [copyFilter]);
  return (
    <React.Fragment>
      <Button
        variant='outlined'
        color='primary'
        className={classes.filter}
        aria-owns={anchor ? `plant-filter` : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Typography variant="body1">{text}</Typography>
      </Button>
      {
        <Menu
          className={classes.menu}
          id={`plant-filter`}
          anchorEl={anchor}
          open={!!anchor}
          onClose={handleClose}
        >
          <MenuItem onClick={clearSelection}>TODAS</MenuItem>
          {lodashMap(list, item => (
            <MenuItem key={item.id} onClick={handleSelect({ ...item })}>
              {selected[item.id] && <Icon color='primary'>done</Icon>}
              {item.name}
            </MenuItem>
          ))}
        </Menu>
      }
    </React.Fragment>
  );
};

export default React.memo(withStyles(styles, { withTheme: true })(PlantFilter));
