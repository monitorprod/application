import React from "react";
import { Icon, Tooltip, Typography } from "@material-ui/core";
import { withStyles } from "../../../utils";

const styles = theme => ({
  tooltip: {
    position: "absolute",
    right: -10
  },
  icon: {
    color: theme.palette.primary.header
  },
  label: {
    color: theme.palette.common.white
  }
});

const RoleHelp = withStyles(styles, { withTheme: true })(
  ({ classes, option = {}, data = {}, field }) => {
    return (
      <Tooltip
        className={classes.tooltip}
        placement="right"
        title={
          <React.Fragment>
            {option.writeMasterData && (
              <Typography className={classes.label} variant="body1">
                - Criar/Modificar Cadastros
              </Typography>
            )}
            {option.readMasterData && (
              <Typography className={classes.label} variant="body1">
                - Visualizar Cadastros
              </Typography>
            )}
            {option.crudAdminData && (
              <Typography className={classes.label} variant="body1">
                - Acesso a Dados Administração
              </Typography>
            )}
            {option.crudUserData && (
              <Typography className={classes.label} variant="body1">
                - Cadastro Usuario/Perfil
              </Typography>
            )}
            {option.writeActiveProductionOrders && (
              <Typography className={classes.label} variant="body1">
                - Criar Ordens Produção
              </Typography>
            )}
            {option.writeScheduledStopProductionOrders && (
              <Typography className={classes.label} variant="body1">
                - Criar Ordens Não Produção
              </Typography>
            )}
            {option.openProductionOrders && (
              <Typography className={classes.label} variant="body1">
                - Liberar Ordens (sequenciaador)
              </Typography>
            )}
            {option.writeProductionOrderEvents && (
              <Typography className={classes.label} variant="body1">
                - Apontar Eventos Ordem
              </Typography>
            )}
            {option.editProductionOrderEvents && (
              <Typography className={classes.label} variant="body1">
                - Modificar Eventos Ordem
              </Typography>
            )}
            {option.readProductionOrders && (
              <Typography className={classes.label} variant="body1">
                - Visualizar Ordens
              </Typography>
            )}
            {option.readProductionOrderReports && (
              <Typography className={classes.label} variant="body1">
                - Visualizar Relatorios
              </Typography>
            )}
            {option.readPendingWaste && (
              <Typography className={classes.label} variant="body1">
                - Visualizar Refugo
              </Typography>
            )}
            {option.writePendingWaste && (
              <Typography className={classes.label} variant="body1">
                - Apontar Refugo
              </Typography>
            )}
            {option.editPendingWaste && (
              <Typography className={classes.label} variant="body1">
                - Modificar Refugo
              </Typography>
            )}
          </React.Fragment>
        }
      >
        <Icon className={classes.icon}>help</Icon>
      </Tooltip>
    );
  }
);

export default RoleHelp;
