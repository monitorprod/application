import React, { useState, useEffect } from "react";
import { Icon, Button, Menu, MenuItem, Typography, TextField } from "@material-ui/core";
import { withStyles, lodashGet, lodashMap, useFindService } from "../../utils";

const styles = theme => ({
  menu: {
    height: 300
  },
  icon: {
    color: theme.palette.common.white
  }
});

const Filter = ({ classes, field, query = {}, setFindQuery }) => {
  // TODO useMemo and useReduce
  // const [query, setQuery] = useState({});
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState();
  const [sortType, setSortType] = useState();
  const { list } = useFindService({
    // const { list, loading, errors } = useFindService({
    model: lodashGet(field, "model.service"),
    query: lodashGet(field, "model.query")
  });
  const [anchor, setAnchor] = useState(null);
  const handleClick = e => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);
  const handleSearch = ({ target }) => {
    setSearch(target.value);
  };
  const handleSelect = ({ id }) => () => {
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
    setSearch();
    setSortType();
    handleClose();
  };
  const sortASC = () => {
    setSortType(1);
    handleClose();
  };
  const sortDESC = () => {
    setSortType(-1);
    handleClose();
  };
  const selectedString = JSON.stringify(selected);
  const queryString = JSON.stringify(query);
  useEffect(() => {
    setFindQuery(prev => {
      const newQuery = { ...prev, ...JSON.parse(queryString) };
      const param = lodashGet(field, "model.identity") || lodashGet(field, "identity");
      const values = Object.keys(JSON.parse(selectedString));
      if (param && values.length) {
        newQuery[param] = {
          $in: values
        };
      } else {
        delete newQuery[param];
      }
      return newQuery;
    });
  }, [selectedString, queryString, field, setFindQuery]);
  useEffect(() => {
    setFindQuery(prev => {
      const newQuery = { ...prev, ...JSON.parse(queryString) };
      const param = lodashGet(field, "filter.identity") || lodashGet(field, "identity");
      if (param && search) {
        newQuery[param] = {
          $like: `%${search}%`
        };
      } else {
        delete newQuery[param];
      }
      return newQuery;
    });
  }, [queryString, search, field, setFindQuery]);
  useEffect(() => {
    setFindQuery(prev => {
      const newQuery = { ...prev, ...JSON.parse(queryString) };
      const param = lodashGet(field, "filter.identity") || lodashGet(field, "identity");
      if (param && sortType) {
        newQuery["$sort"] = {
          [param]: sortType
        };
      } else if (param !== "identity" && param !== "name") {
        delete newQuery["$sort"][param];
      }
      return newQuery;
    });
  }, [queryString, sortType, field, setFindQuery]);
  const modelCustomName = lodashGet(field, "model.customName");
  return (
    <React.Fragment>
      <Button
        aria-owns={anchor ? `filter-${field.text}` : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Typography variant="body1">{field.text}</Typography>
        <Icon className={classes.icon}>arrow_drop_down</Icon>
        {(Object.keys(selected).length > 0 || search || sortType) && (
          <Icon className={classes.icon}>filter_list</Icon>
        )}
      </Button>
      {(field.model || field.filter) && (
        <Menu
          className={classes.menu}
          id={`filter-${field.text}`}
          anchorEl={anchor}
          open={!!anchor}
          onClose={handleClose}
        >
          <MenuItem onClick={sortASC}>
            {sortType === 1 && <Icon>done</Icon>}Ordenação ascendente
          </MenuItem>
          <MenuItem onClick={sortDESC}>
            {sortType === -1 && <Icon>done</Icon>}Ordenação descendente
          </MenuItem>
          <MenuItem onClick={clearSelection}>Remover filtros</MenuItem>
          {field.filter && (
            <MenuItem>
              <TextField
                name={field.identity}
                label={"Pesquisa"}
                value={search}
                onChange={handleSearch}
              />
            </MenuItem>
          )}
          {lodashMap(list, item => (
            <MenuItem key={item.id} onClick={handleSelect({ id: item.id })}>
              {selected[item.id] && <Icon>done</Icon>}
              {!modelCustomName && item.name}
              {modelCustomName && modelCustomName({ data: item })}
            </MenuItem>
          ))}
        </Menu>
      )}
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(Filter);
