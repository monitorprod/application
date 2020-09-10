import React, { useContext, useState } from "react";
import moment from "moment";
import NumberFormat from "react-number-format";
import { Grid, Typography } from "@material-ui/core";
import ApiContext from "../../../../api";
import { withStyles, lodashGet, getColor } from "../../../../utils";
import { Button, FormInput } from "../../../../components";

const styles = theme => ({
  label: {
    padding: `0 ${theme.spacing(1 / 2)}px`
  },
  details: {
    display: "block",
    padding: theme.spacing(2)
  },
  item: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    borderBottom: `1px solid ${theme.palette.secondary.form}`
  },
  turnName: {
    fontStyle: "italic"
  }
});

const StatusLine = ({ classes, index, isFirst, hasEditAccess, history, typesMap, event, reload }) => {
  const client = useContext(ApiContext);
  const [formItem, setFormItem] = useState({});
  const [allowEdition, setAllowEdition] = useState();
  const handleChange = ({ identity }) => ({ target }) => {
    const value = target.value;
    if (value && value !== -1) {
      setFormItem(prev => ({ ...prev, [target.name]: value }));
    }
  };
  const handleEdit = () => setAllowEdition(prev => !prev);
  const handleUpdate = () => {
    if (formItem.ev && lodashGet(history, "_id")) {
      client.service("production_order_history").patch(lodashGet(history, "_id"), {
        $editEvent: {
          index,
          ev: formItem.ev,
          at: lodashGet(typesMap, `${formItem.ev}.productionOrderActionTypeId`)
        }
      });
      event.ev = formItem.ev;
      setAllowEdition(false);
      if (reload) {
        reload()
      }
    }
  };
  const getActionType = ({ type }) =>
    lodashGet(client.get(`config.productionOrder.eventType.${type}`), "value");
  return (
    <React.Fragment>
      <Grid
        item
        style={{
          backgroundColor:
            getColor({
              data: client.get(
                `actionType.${lodashGet(typesMap, `${event.ev}.productionOrderActionTypeId`)}`
              ),
              path: "color"
            }) ||
            getColor({
              data: client.get(
                `actionType.${lodashGet(
                  client.get("config.productionOrder.eventType.undefined"),
                  "value"
                )}`
              ),
              path: "color"
            })
        }}
      />
      <Grid item className={classes.item}>
        {!allowEdition && (
          <Typography variant="body1">
            {`${lodashGet(typesMap, `${event.ev}.name`) ||
              lodashGet(
                client.get(
                  `actionType.${lodashGet(
                    client.get("config.productionOrder.eventType.undefined"),
                    "value"
                  )}`
                ),
                "name"
              )}`}
          </Typography>
        )}
        {allowEdition && (
          <FormInput
            field={{
              text: "Evento",
              identity: "ev",
              model: {
                service: "production_order_event_types",
                query: {
                  productionOrderActionTypeId: {
                    $in: [
                      `${getActionType({ type: "setup" })}`,
                      `${getActionType({ type: "scheduledStop" })}`,
                      `${getActionType({ type: "noScheduledStop" })}`,
                      `${getActionType({ type: "noWorkDay" })}`
                    ]
                  }
                }
              }
            }}
            formItem={{ ...formItem }}
            handleChange={handleChange({ identity: "ev" })}
          />
        )}
        {hasEditAccess && lodashGet(history, "_id") &&
          !isFirst &&
          [
            `${getActionType({ type: "noJustified" })}`,
            `${getActionType({ type: "setup" })}`,
            `${getActionType({ type: "scheduledStop" })}`,
            `${getActionType({ type: "noScheduledStop" })}`,
            `${getActionType({ type: "noWorkDay" })}`,
            `${getActionType({ type: "undefined" })}`,
            `${-1}`
          ].indexOf(`${event.at}`) !== -1 && (
            <React.Fragment>
              {!allowEdition && (
                <Button
                  type="icon"
                  text="Editar"
                  icon="edit_icon"
                  variants="editAction"
                  onClick={handleEdit}
                />
              )}
              {allowEdition && (
                <React.Fragment>
                  <Button
                    type="icon"
                    text="Gravar"
                    icon="save"
                    variants="editAction"
                    onClick={handleUpdate}
                  />
                  <Button
                    type="icon"
                    text="Cancelar"
                    icon="close"
                    variants="editAction"
                    onClick={handleEdit}
                  />
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        <div style={{ flex: "1" }} />
        {parseInt(event.tr, "10") > 0 && (
          <Typography className={classes.label} variant="body1">
            <NumberFormat
              value={`${event.tr}`}
              displayType={"text"}
              thousandSeparator={"."}
              decimalSeparator={","}
            />{" "}
            ciclos |
          </Typography>
        )}
        {event.userName && (
          <Typography className={classes.label} variant="body1">
            {event.userName} |
          </Typography>
        )}
        <Typography className={classes.label} variant="body1">
          {`${moment(event.ed === -1 ? moment() : event.ed).format("DD/MM/YYYY HH:mm")}`}
        </Typography>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(StatusLine);
