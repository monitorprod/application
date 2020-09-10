import React, { useContext, useState, useEffect } from "react";
import { TableRow, TableCell, Typography } from "@material-ui/core";
import ApiContext from "../../../api";
import { withStyles, lodashGet, getColor, getEventType } from "../../../utils";
import Status from "../production/Status";
import ProductionGauge from "./ProductionGauge";

const styles = theme => ({
  label: {
    fontSize: ".65rem"
  },
  title: {
    padding: `${theme.spacing(1)}px 0`,
    height: "100%",
    minHeight: 58
  },
  row: {
    "& td": {
      padding: `0 ${theme.spacing(2)}px`
    }
  },
  status: {
    padding: `${theme.spacing(0)}px !important`,
    "& > div": {
      margin: "0 auto"
    }
  }
});

const MachineRow = ({ classes, machine, typesMap, filters, isSameDay, reload }) => {
  const client = useContext(ApiContext);
  const undefinedEventType = getEventType({ client, type: "undefined" });
  const undefinedColor = getColor({
    data: client.get(`actionType.${undefinedEventType}`),
    path: "color"
  });
  const [data, setData] = useState({});
  useEffect(() => {
    let total = 0;
    machine.history.map(item => (total += item.value[0]));
    setData({
      labels: [],
      series: machine.history.length
        ? machine.history
        : [
          {
            at: -1,
            ev: -1,
            bgColor: undefinedColor,
            diff: 1440,
            meta: "SISTEMA SEM COMUNICAÇÃO",
            value: [1440]
          }
        ]
    });
  }, [machine, undefinedColor]);
  // console.log("!!!!data", machine.id, machine.identity, machine.stats, machine.history);
  return (
    <TableRow className={classes.row}>
      <TableCell className={classes.title}>
        <Typography variant="body1">{machine.identity}</Typography>
        <Typography className={classes.label} component="p">
          {machine.name}
        </Typography>
      </TableCell>
      <TableCell>
        {/* <ProductionGauge filters={filters} header /> */}
        <ProductionGauge filters={filters} data={data} typesMap={typesMap} reload={reload} />
      </TableCell>
      <TableCell>
        <Typography variant="body1">
          {parseFloat(lodashGet(machine, "stats.oem")) >= 0
            ? `${lodashGet(machine, "stats.oem")}%`
            : "ND"}
        </Typography>
      </TableCell>
      {isSameDay && (
        <TableCell className={classes.status}>
          <Status productionOrder={machine.productionOrder} size={40} />
        </TableCell>
      )}
    </TableRow>
  );
};

export default withStyles(styles, { withTheme: true })(MachineRow);
