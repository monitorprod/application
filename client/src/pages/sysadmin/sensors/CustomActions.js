import React, { useContext } from "react";
import { Grid } from "@material-ui/core";
import ApiContext from "../../../api";
import { withRouter, withStyles, lodashGet } from "../../../utils";
import Button from "../../../components/buttons";

const styles = theme => ({});

const CustomActions = withRouter(
  withStyles(styles, { withTheme: true })(({ history, classes, data = {} }) => {
    const client = useContext(ApiContext);
    const archiveStatus = lodashGet(client.get("config.sensor.status.archived"), "value");
    const handleArchive = async () => {
      await client.service("sensors").patch(data.id, {
        identity: `${data.identity}-ARQ${Date.now()}`,
        sensorStatusId: archiveStatus,
        companyId: null
      });
      const newSensor = await client.service("sensors").create({
        barcode: data.barcode,
        identity: data.identity,
        sensorStatusId: data.sensorStatusId
      });
      history.push(`/sysadmin/sensors/${newSensor.id}`);
    };
    const handleSync = async () => {
      // const request = new URL(`http://localhost:3030/sync_sensor`);
      const request = new URL(`http://${data.identity}.local:3030/sync_sensor`);
      const params = { sensorUUID: data.uuid, companyUUID: lodashGet(data, "company.uuid") };
      request.search = new URLSearchParams(params);
      const response = await (await fetch(request)).json();
      if (response.status === "OK") {
        alert("SYNC DONE!");
      }
    };
    return (
      <React.Fragment>
        {data.id && data.sensorStatusId !== archiveStatus && data.companyId && (
          <Grid item>
            <Button text="Arquivar" icon="archive" onClick={handleArchive} />
          </Grid>
        )}
        {data.id && data.sensorStatusId !== archiveStatus && data.companyId && (
          <Grid item>
            <Button text="Sync" icon="sync" onClick={handleSync} />
          </Grid>
        )}
      </React.Fragment>
    );
  })
);

export default CustomActions;
