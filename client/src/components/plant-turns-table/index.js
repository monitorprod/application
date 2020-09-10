import React, { useRef, useContext, useState, useEffect } from "react";
import moment from "moment";
import { Grid } from "@material-ui/core";
import ApiContext from "../../api";
import {
  withStyles,
  lodashGet,
  lodashForEach,
  lodashMap,
  lodashFilter,
  lodashReduce,
  getPermissions,
  validateForm,
  useFindService,
  useAuth
} from "../../utils";
import { form as fields } from "./model";
import NewTurnPanel from "./NewTurn";
import TurnPanel from "./TurnPanel";
import Form from "./Form";

const styles = theme => ({});

const PlantTurnsTable = ({ classes, plant, handleChange: propsHandleChange, options = {} }) => {
  const { permissions } = useAuth();
  const client = useContext(ApiContext);
  const [formItem, setFormItem] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const handleChange = ({ target }) =>
    setFormItem(prev => ({ ...prev, [target.name]: target.value }));
  const query = {
    plantId: plant.id
  };
  const { list, reload, setQuery } = useFindService({
    model: "turns",
    query: {
      ...query,
      $populateAll: true
    }
  });
  const stringQuery = JSON.stringify(query);
  useEffect(() => {
    setQuery(prev => ({ ...prev, ...JSON.parse(stringQuery) }));
    setExpanded();
  }, [stringQuery, setQuery]);
  const FormRef = useRef(null);
  const refsMap = {};
  const setFormRef = ({ id }) => ref => (refsMap[id] = ref);
  const [expanded, setExpanded] = useState();
  const handleExpand = ({ id, ...rest }) => () => {
    FormRef.current = refsMap[id];
    resetForm();
    if (expanded === id) {
      setExpanded();
      FormRef.current = null;
    } else {
      setExpanded(id);
      setFormItem({ id, ...rest });
    }
  };
  const resetForm = () => {
    setFormErrors({});
    setFormItem({});
  };
  const resetList = () => {
    reload();
  };
  const handleSubmit = async ({ turn } = {}) => {
    setFormErrors({});
    let continueOperation = true;
    if (
      !validateForm({
        fields,
        formItem,
        setFormErrors
      })
    ) {
      continueOperation = false;
    }
    const newTurn = {
      ...query,
      ...turn,
      ...formItem,
      id: lodashGet(turn, "id")
    };
    if (
      !newTurn.monday &&
      !newTurn.tuesday &&
      !newTurn.wednesday &&
      !newTurn.thursday &&
      !newTurn.friday &&
      !newTurn.saturday &&
      !newTurn.sunday
    ) {
      continueOperation = false;
      setFormErrors(prev => ({ ...prev, name: "Selecione pelo menos um dia" }));
    }
    // if (moment(newTurn.endTime).diff(moment(newTurn.startTime), "minutes") <= 0) {
    //   continueOperation = false;
    //   setFormErrors(prev => ({ ...prev, endTime: "Horário agendado não válido" }));
    // }
    lodashForEach(list, turn => {
      if (`${turn.id}` === `${newTurn.id}`) {
        return;
      }
      const turnStartT = moment(turn.startTime).set({
        year: 2019,
        month: 0,
        date: 1
      });
      const turnEndT = moment(turn.endTime).set({
        year: 2019,
        month: 0,
        date: 1
      });
      if (turnStartT.isSameOrAfter(turnEndT, "minute")) {
        turnStartT.subtract(1, "days");
      }
      const newTurnStartT = moment(newTurn.startTime).set({
        year: 2019,
        month: 0,
        date: 1
      });
      const newTurnEndT = moment(newTurn.endTime).set({
        year: 2019,
        month: 0,
        date: 1
      });
      if (newTurnStartT.isSameOrAfter(newTurnEndT, "minute")) {
        newTurnStartT.subtract(1, "days");
      }
      if (
        ((!!turn.monday && !!newTurn.monday) ||
          (!!turn.tuesday && !!newTurn.tuesday) ||
          (!!turn.wednesday && !!newTurn.wednesday) ||
          (!!turn.thursday && !!newTurn.thursday) ||
          (!!turn.friday && !!newTurn.friday) ||
          (!!turn.saturday && !!newTurn.saturday) ||
          (!!turn.sunday && !!newTurn.sunday)) &&
        (newTurnStartT.isBetween(turnStartT, turnEndT, "minute") ||
          newTurnEndT.isBetween(turnStartT, turnEndT, "minute"))
      ) {
        continueOperation = false;
        setFormErrors(prev => ({
          ...prev,
          startTime: "O horário marcado se sobrepõe a outro turno"
        }));
      }
    });
    if (!continueOperation) {
      return;
    }
    if(!newTurn.id){
      newTurn.startTime = moment(newTurn.startTime).subtract(1, "hours").toDate()
      newTurn.endTime = moment(newTurn.endTime).subtract(1, "hours").toDate()
    }
    await client.service("plants").patch(plant.id, {
      turns: [newTurn]
    });
    resetList();
    resetForm();
    setExpanded();
  };
  const handleDelete = async ({ turn }) => {
    if (!window.confirm("Você quer apagar o item?")) {
      return;
    }
    await client.service("turns").remove(turn.id);
    resetList();
  };
  useEffect(() => {
    const hoursPerWeek =
      Math.round(
        (10 *
          lodashReduce(
            list,
            (hours, turn) => {
              const days = lodashFilter(
                ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                day => !!turn[day]
              ).length;
              let diff = moment(turn.endTime).diff(turn.startTime, "minutes");
              if (diff < 0) {
                diff = 24 * 60 + diff;
              }
              return hours + days * diff;
            },
            0
          )) /
          60
      ) / 10;
    if (hoursPerWeek) {
      client.service("plants").patch(plant.id, {
        hoursPerWeek
      });
      propsHandleChange({
        target: {
          name: "hoursPerWeek",
          value: hoursPerWeek
        }
      });
    }
    propsHandleChange({
      target: {
        name: "turns",
        value: list
      },
      field: {
        type: "table"
      }
    });
  }, [client, plant.id, list, propsHandleChange]);
  const hasWriteAccess = getPermissions({ privileges: options.writePermissions, permissions });
  return (
    <React.Fragment>
      <Grid item>
        {lodashMap(list, (turn, index) => (
          <TurnPanel
            key={index}
            // TODO semantic names instead of "data"
            turn={turn}
            expanded={expanded}
            handleExpand={handleExpand}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            FormRef={FormRef}
            setFormRef={setFormRef}
            options={{
              readOnly: !hasWriteAccess
            }}
          />
        ))}
      </Grid>
      {hasWriteAccess && (
        <Grid item>
          <NewTurnPanel
            expanded={expanded}
            handleExpand={handleExpand}
            handleSubmit={handleSubmit}
            FormRef={FormRef}
            setFormRef={setFormRef}
          />
        </Grid>
      )}
      {FormRef.current && (
        <Form
          fields={fields}
          formItem={formItem}
          formErrors={formErrors}
          handleChange={handleChange}
          FormRef={FormRef}
          options={{
            readOnly: !hasWriteAccess
          }}
        />
      )}
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(PlantTurnsTable);
