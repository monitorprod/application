import React from "react";
import moment from "moment";
import { lodashGet } from "../../../utils";
import CustomActions from "./CustomActions";
import SensorStatus from "./SensorStatus";
import EventStatus from "./EventStatus";

export const list = [
  {
    text: "Eventos",
    identity: "statusEvents",
    customContent: { dontFilter: true },
    customData: ({ ...props }) => <EventStatus {...props} />
  },
  {
    text: "Online",
    identity: "statusSensor",
    customContent: { dontFilter: true },
    customData: ({ ...props }) => <SensorStatus {...props} />
  },
  {
    text: "Cliente",
    identity: "company.fantasyName",
    model: {
      service: "companies",
      identity: "companyId",
      customName: ({ data = {} }) => data.fantasyName
    }
  },
  {
    text: "Cod Sensor",
    identity: "identity",
    filter: {
      type: "string"
    }
  },
  {
    text: "UUID",
    identity: "uuid",
    filter: {
      type: "string"
    }
  },
  {
    text: "IP",
    identity: "ip",
    filter: {
      type: "string"
    }
  },
  {
    text: "Status",
    identity: "sensor_status.name",
    model: {
      service: "sensor_statuses",
      identity: "sensorStatusId"
    }
  }
];

export const form = [
  [
    {
      text: "UUID",
      identity: "uuid",
      variants: "display fullWidth",
      // readOnly: true,
      show: {
        ifThis: "id"
      },
      type: "string"
    }
  ],
  [
    {
      text: "Cod Barra",
      identity: "barcode",
      type: "string"
    },
    {
      text: "Cod Sensor",
      identity: "identity",
      autoFocus: true,
      required: true,
      type: "string"
    },
    {
      text: "Status",
      identity: "sensorStatusId",
      required: true,
      model: "sensor_statuses",
      defaultValue: {
        config: "sensor.status.init"
      }
    }
  ],
  [
    {
      text: "Cliente",
      identity: "companyId",
      type: "string",
      model: {
        service: "companies",
        customContent: { queryField: "fantasyName" },
        customName: ({ data = {} }) => (data ? data.fantasyName : "")
      }
    }
  ],
  [
    {
      text: "MAC",
      identity: "mac",
      variants: "display",
      readOnly: true,
      show: {
        ifThis: "id"
      },
      type: "string"
    },
    {
      text: "IP",
      identity: "ip",
      variants: "display",
      readOnly: true,
      show: {
        ifThis: "id"
      },
      type: "string"
    },
    {
      text: "Data Edicão",
      identity: "updateDate",
      readOnly: true,
      show: {
        ifThis: "id"
      },
      type: "string",
      defaultValue: {
        // TODO a more direct way to format value
        customValue: async ({ data = {}, field, handleChange }) => {
          const date = moment(lodashGet(data, "updatedAt")).format("DD/MM/YYYY HH:mm");
          handleChange({
            target: { name: field.identity, value: date }
          });
        }
      }
    }
  ]
];

export const links = [
  {
    text: "Sensores",
    href: "/sysadmin/sensors"
  }
];

export const metadata = {
  name: "sensors",
  icon: "memory",
  listPath: "/sysadmin/sensors",
  formPath: "/sysadmin/sensors",
  paramsProp: "sensorId",
  newItemText: "Novo Sensor"
};

export default {
  metadata,
  list,
  form,
  links,
  query: {
    $sort: { identity: 1 }
  },
  customContent: {
    customBreadCrumbsName: ({ data = {} }) =>
      `${data.identity ? `${data.identity} - ` : ""}${data.name}`
  },
  // TODO ALL to data = {}
  customActions: ({ isForm, ...props }) => isForm && <CustomActions {...props} />
};
