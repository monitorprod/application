import React from "react";
import { Grid } from "@material-ui/core";
import { Link, withRouter, withStyles, lodashMap, lodashFlattenDeep } from "../../utils";
import Button from "../buttons";

const styles = theme => ({
  container: {
    minHeight: 44,
    marginBottom: theme.spacing(2)
  }
});

const Actions = ({
  history,
  classes,
  model,
  fields,
  formItem,
  handleSubmit,
  handleDelete,
  options = {},
  customContent = {},
  customActions
}) => {
  const handleCopy = () => {
    const copyItem = { ...formItem };
    delete copyItem.id;
    delete copyItem.uuid;
    localStorage.setItem(`copy-${model.name}`, JSON.stringify(copyItem));
    lodashMap(lodashFlattenDeep(fields), field => {
      if (field.defaultValue) {
        window.localStorage.setItem(`dont-default${field.identity}`, true);
      }
    });
    history.push(`${model.formPath}/new`);
  };
  return (
    <Grid
      item
      container
      spacing={1}
      direction="row"
      justify="flex-start"
      alignItems="center"
      className={classes.container}
    >
      {!options.dontSave &&
        (!customContent.dontEdit || customContent.dontEdit({ data: formItem })) && (
          <Grid item>
            <Button
              type="submit"
              text="Gravar"
              icon="save"
              variants="submit"
              onClick={handleSubmit}
            />
          </Grid>
        )}
      {formItem.id &&
        !options.dontDelete &&
        (!customContent.dontDelete || customContent.dontDelete({ data: formItem })) && (
          <Grid item>
            <Button
              text="Deletar"
              icon="delete"
              variants="delete"
              onClick={handleDelete(formItem)}
            />
          </Grid>
        )}
      {formItem.id && !options.dontCreate && (
        <Grid item>
          <Button text="Criar Novo" icon="add" component={Link} to={`${model.formPath}/new`} />
        </Grid>
      )}
      {formItem.id && !options.dontCreate && !options.dontCopy && (
        <Grid item>
          <Button text="Criar como Copia" icon="file_copy" onClick={handleCopy} />
        </Grid>
      )}
      {customActions && customActions({ isForm: true, data: formItem })}
    </Grid>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(Actions));
