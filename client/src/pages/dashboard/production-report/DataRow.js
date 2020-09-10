import React from "react";
import moment from "moment";
import { TableCell, TableRow, Typography, Icon } from "@material-ui/core";
import NumberFormat from "react-number-format";
import {
  withStyles,
  classNames,
  lodashGet,
  lodashIsNil,
  lodashMap,
} from "../../../utils";

const styles = (theme) => ({
  body: {
    "& td": {
      padding: theme.spacing(1),
      "& p,& a span": {
        fontSize: ".75rem",
      },
    },
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
  },
  expanded: {
    transform: "rotate(180deg)",
  },
  icon: {
    margin: `0 ${theme.spacing(1)}px`,
  },
  group: {
    cursor: "pointer",
    backgroundColor: theme.palette.primary.table,
  },
});

const DataRow = ({ classes, header, item, groupBy = {} }) => (
  <TableRow
    className={classNames([classes.body, { [classes.group]: groupBy.enabled }])}
  >
    {groupBy.enabled && (
      <TableCell
        style={{ whiteSpace: "nowrap" }}
        colSpan={groupBy.colspan}
        onClick={
          groupBy.handleGroupExpand &&
          groupBy.handleGroupExpand({ id: groupBy.expandId })
        }
      >
        <div className={classes.wrapper}>
          {groupBy.expandId && (
            <Icon
              className={classNames(classes.icon, {
                [classes.expanded]: groupBy.expanded,
              })}
            >
              expand_more_icon
            </Icon>
          )}
          <Typography variant="body1">{groupBy.text}</Typography>
        </div>
      </TableCell>
    )}
    {lodashMap(header, ({ path, alt, type, add }, index) => {
      const value = lodashGet(item, path);
      const isNil = lodashIsNil(value);
      return (
        (!groupBy.enabled || add) && (
          <TableCell key={index} style={{ whiteSpace: "nowrap" }}>
            <Typography variant="body1">
              {!isNil &&
                type === "datetime" &&
                moment(value).format("DD/MM/YYYY HH:mm")}
              {!isNil && type === "integer" && (
                <NumberFormat
                  value={value}
                  displayType={"text"}
                  thousandSeparator={"."}
                  decimalSeparator={","}
                />
              )}
              {!isNil && type === "decimal" && (
                <NumberFormat
                  value={parseFloat(value).toFixed(2).replace(".", ",")}
                  displayType={"text"}
                  thousandSeparator={"."}
                  decimalSeparator={","}
                />
              )}
              {!isNil &&
                ["datetime", "integer", "decimal"].indexOf(type) === -1 &&
                value}
              {isNil && alt}
            </Typography>
          </TableCell>
        )
      );
    })}
  </TableRow>
);

export default withStyles(styles, { withTheme: true })(DataRow);
