import React, { useState } from "react";
import moment from "moment";
import { DatePicker } from "@material-ui/pickers";
import { Button, IconButton, Icon } from "@material-ui/core";
import { withStyles } from "../../utils";

const styles = theme => ({
  filter: {
    //backgroundColor: "rgba(255, 255, 255, .15)",
    color: theme.palette.common.black,
    display: "flex",
    alignItems: "center",
    margin: theme.spacing(1),
    borderRadius: 50,
    padding: 4,
    [theme.breakpoints.down("xs")]: {
      margin: 3,
      padding: 2
    }
  },
  arrow: {
    padding: 0,
    // color: theme.palette.common.black,
  }
});

const DateFilter = ({ classes, date, setDate = () => {}, maxDate, minDate, isEndDate }) => {
  const handleChange = date => {
    if (isEndDate) {
      setDate(
        moment(date)
          .subtract(1, "day")
          .endOf("day")
          .add(6, "hours")
      );
    } else {
      setDate(
        moment(date)
          .startOf("day")
          .add(6, "hours")
      );
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={classes.filter}>
      <IconButton
        color='primary'
        className={classes.arrow}
        onClick={() => {
          if (
            !minDate ||
            (minDate &&
              !moment(date)
                .subtract(1, "day")
                .isSame(minDate, "day"))
          ) {
            handleChange(moment(date).subtract(1, "day"));
          }
        }}
      >
        <Icon>arrow_back_ios</Icon>
      </IconButton>
      <Button size="small" onClick={() => setIsOpen(true)} color='primary'>
        {date.format("ddd, DD [de] MMM HH:mm")}
      </Button>
      <IconButton
        color='primary'
        className={classes.arrow}
        onClick={() => {
          console.log("!!!max")
          if (
            !maxDate ||
            (maxDate &&
              !moment(date)
                .add(1, "day")
                .isAfter(maxDate, "day"))
          ) {
            handleChange(moment(date).add(1, "day"));
          }
        }}
      >
        <Icon>arrow_forward_ios</Icon>
      </IconButton>
      <div hidden>
        <DatePicker
          format="DD/MM/YYYY HH:mm"
          locale="pt"
          cancelLabel="CANCELAR"
          autoOk
          value={date}
          minDate={minDate}
          maxDate={maxDate}
          onChange={handleChange}
          open={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(DateFilter);
