import { useState, useEffect } from "react";
import { lodashFind } from "./lodash";
import useFindService from "./useFindService";

const useSensorAllURL = () => {
  const [unreachableSensors, setUnreachableSensors] = useState([]);
  const [sensorsURL, setSensorsURL] = useState("");
  const { list } = useFindService({
    model: "sensors"
  });
  useEffect(() => {
    const getStatusSensor = async () => {
      const sensor =
        lodashFind(
          list,
          sensor => sensor.ip && sensor.machineId && unreachableSensors.indexOf(sensor.id) === -1
        ) || {};
      const deviceURL = `http://${sensor.ip}:3030`;
      const FETCH_TIMEOUT = 5000;
      let didTimeOut = false;
      const response = await new Promise((resolve, reject) => {
        const fetchTimeout = setTimeout(() => {
          didTimeOut = true;
          resolve({
            sensorId: sensor.id
          });
        }, FETCH_TIMEOUT);
        fetch(`${deviceURL}/use_status_sensor`)
          .then(() => {
            clearTimeout(fetchTimeout);
            if (!didTimeOut) {
              resolve({
                url: `http://${sensor.ip}:3030/realtime-dashboard`
              });
            }
          })
          .catch(() =>
            resolve({
              sensorId: sensor.id
            })
          );
      });
      if (response.sensorId) {
        setUnreachableSensors(prev => [...prev, response.sensorId]);
      } else {
        setSensorsURL(response.url);
      }
    };
    getStatusSensor();
  }, [list, unreachableSensors]);
  return { sensorsURL };
};

export default useSensorAllURL;
