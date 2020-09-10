import { useContext, useState, useEffect } from "react";
import ApiContext from "../api";
import getColor from "./getColor";
import getEventType from "./getEventType";

const useStatusSensor = ({ ip }) => {
  const client = useContext(ApiContext);
  const activeEventType = getEventType({ client, type: "active" });
  const undefinedEventType = getEventType({ client, type: "undefined" });
  const activeColor = getColor({
    data: client.get(`actionType.${activeEventType}`),
    path: "color"
  });
  const undefinedColor = getColor({
    data: client.get(`actionType.${undefinedEventType}`),
    path: "color"
  });
  const [status, setStatus] = useState(undefinedColor);
  const deviceURL = `http://${ip}:3030`;
  useEffect(() => {
    const getStatusSensor = async () => {
      const FETCH_TIMEOUT = 5000;
      let didTimeOut = false;
      const response = await new Promise((resolve, reject) => {
        const fetchTimeout = setTimeout(() => {
          didTimeOut = true;
          resolve(undefinedColor);
        }, FETCH_TIMEOUT);
        // fetch(`${client.get("cloudURL")}/redirect_status_sensor?url=${deviceURL}/use_status_sensor`)
        fetch(`${deviceURL}/use_status_sensor`)
          .then(() => {
            clearTimeout(fetchTimeout);
            if (!didTimeOut) {
              resolve(activeColor);
            }
          })
          .catch(() => resolve(undefinedColor));
      });
      setStatus(response);
    };
    getStatusSensor();
    const getStatusInterval = setInterval(() => {
      getStatusSensor();
    }, 10000);
    return () => {
      clearInterval(getStatusInterval);
    };
  }, [activeColor, deviceURL, undefinedColor]);
  return { status, href: `${deviceURL}/use_status_sensor` };
};

export default useStatusSensor;
