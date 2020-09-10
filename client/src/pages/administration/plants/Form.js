import React from "react";
import { withStyles } from "../../../utils";
import { withMasterDataFormPage, PlantTurnsTable, PlantHolidaysTable } from "../../../components";
import PlatnsModel from "./model";

const styles = theme => ({});

const AdminPlantFormPage = ({ classes }) =>
  withMasterDataFormPage({
    ...PlatnsModel,
    customContent: {
      afterForm: ({ data, handleChange }) =>
        data.id && (
          <React.Fragment>
            <PlantTurnsTable
              options={PlatnsModel.options}
              plant={data}
              handleChange={handleChange}
            />
            <PlantHolidaysTable options={PlatnsModel.options} plant={data} />
          </React.Fragment>
        )
    }
  });

export default withStyles(styles, { withTheme: true })(AdminPlantFormPage);
