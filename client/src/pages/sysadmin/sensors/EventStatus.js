import React, { useContext, useState, useEffect } from "react";
import moment from "moment";
import ApiContext from "../../../api";
import { withStyles, lodashGet, getEventType, getColor } from "../../../utils";

const styles = theme => ({
  status: {
    marginLeft: 20,
    height: 30,
    width: 30,
    borderRadius: "50%"
  }
});

const EventStatus = withStyles(styles, { withTheme: true })(({ classes, data = {} }) => {
  const client = useContext(ApiContext);
  const activeEventType = getEventType({ client, type: "active" });
  const noScheduledStopEventType = getEventType({ client, type: "noScheduledStop" });
  const scheduledStopEventType = getEventType({ client, type: "scheduledStop" });
  const activeColor = getColor({
    data: client.get(`actionType.${activeEventType}`),
    path: "color"
  });
  const noScheduledStopColor = getColor({
    data: client.get(`actionType.${noScheduledStopEventType}`),
    path: "color"
  });
  const scheduledStopColor = getColor({
    data: client.get(`actionType.${scheduledStopEventType}`),
    path: "color"
  });
  const [status, setStatus] = useState(scheduledStopColor);
  useEffect(() => {
    const getStatusEvent = async () => {
      const { data: events } = await client.service("production_order_events").find({
        query: {
          si: data.id,
          "r.0": { $exists: true },
          sd: {
            $gte: moment()
              .startOf("day")
              .toDate()
          },
          $sort: {
            sd: -1
          },
          $limit: 1
        }
      });
      if (!events.length) {
        return setStatus(scheduledStopColor);
      }
      const eventDiff = moment().diff(moment(lodashGet(events, "0.ed")), "minutes");
      if (eventDiff > 30) {
        return setStatus(scheduledStopColor);
      } else if (eventDiff > 15) {
        return setStatus(noScheduledStopColor);
      } else {
        return setStatus(activeColor);
      }
    };
    getStatusEvent();
  }, [client, data.id, activeColor, noScheduledStopColor, scheduledStopColor]);
  return (
    <div
      className={classes.status}
      style={{
        background: status
      }}
    />
  );
});

export default EventStatus;
