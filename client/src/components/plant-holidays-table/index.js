import React, { useRef, useContext, useState, useEffect } from "react";
import moment from "moment";
import { Grid } from "@material-ui/core";
import ApiContext from "../../api";
import {
  withStyles,
  lodashGet,
  lodashMap,
  lodashFilter,
  getPermissions,
  validateForm,
  useFindService,
  useAuth
} from "../../utils";
import { form as fields } from "./model";
// TODO same name!!
import NewHolidayPanel from "./NewHoliday";
import HolidayPanel from "./HolidayPanel";
import Form from "./Form";

const styles = theme => ({});

const PlantHolidaysTable = ({ classes, plant, options = {} }) => {
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
    model: "holidays",
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
  const handleSubmit = async ({ holiday } = {}) => {
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
    const newHoliday = {
      ...query,
      ...holiday,
      ...formItem,
      id: lodashGet(holiday, "id")
    };
    if (!continueOperation) {
      return;
    }
    await client.service("plants").patch(plant.id, {
      holidays: [newHoliday]
    });
    resetList();
    resetForm();
    setExpanded();
  };
  const handleDelete = async ({ holiday }) => {
    if (!window.confirm("Você quer apagar o item?")) {
      return;
    }
    await client.service("holidays").remove(holiday.id);
    resetList();
  };
  const hasWriteAccess = getPermissions({ privileges: options.writePermissions, permissions });
  return (
    <React.Fragment>
      <Grid item>
        {lodashMap(
          lodashFilter(list, day => moment(day.startDate).year() === moment().year()).sort((a, b) =>
            moment(a.startDate).diff(moment(b.startDate), "minutes")
          ),
          (holiday, index) => (
            <HolidayPanel
              key={index}
              // TODO semantic names instead of "data"
              holiday={holiday}
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
          )
        )}
      </Grid>
      {hasWriteAccess && (
        <Grid item>
          <NewHolidayPanel
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

export default withStyles(styles, { withTheme: true })(PlantHolidaysTable);
