import React from "react";
import { Grid } from "@material-ui/core";
import { withStyles, lodashMap, useFindDeleteService } from "../../utils";
import NotFound from "../not-found";
import Loader from "../loader";
import Errors from "../errors";
import GridToolbar from "./GridToolbar";
import GridCard from "./GridCard";

const styles = theme => ({
  container: {
    flexWrap: "nowrap"
  },
  grid: {
    overflowY: "auto"
  }
});

const MasterDataGrid = ({
  classes,
  model,
  fields,
  query = {},
  options = {},
  customContent = {},
  customActions
}) => {
  const {
    list,
    handleDelete,
    deleteRef,
    deleteLoading,
    findLoading,
    errors
  } = useFindDeleteService({ model: model.name, query });
  const empty = !findLoading && !errors && list.length === 0;
  return (
    <Grid container direction="column" className={classes.container}>
      <GridToolbar model={model} options={options} />
      {findLoading && <Loader />}
      {errors && <Errors errors={errors} />}
      {empty && <NotFound />}
      {!findLoading && (
        <Grid className={classes.grid} container spacing={1}>
          {lodashMap(list, item => (
            <Grid item xs={12} sm={6} key={item.id}>
              <GridCard
                model={model}
                fields={fields}
                data={item}
                loading={deleteRef[item.id] && deleteLoading}
                handleDelete={handleDelete}
                options={options}
                customContent={customContent}
                customActions={customActions}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(MasterDataGrid);
