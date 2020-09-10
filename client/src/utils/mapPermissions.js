import { lodashForEach, lodashReduce } from "./lodash";

const getPermissions = ({ payload, privilege }) =>
  lodashReduce(payload.roles, (permission, role) => permission || role[privilege], false);

const mapPermissions = ({ payload = {} }) => {
  const userPermissions = {};
  lodashForEach(
    [
      "writeMasterData",
      "readMasterData",
      "crudAdminData",
      "crudUserData",
      "writeActiveProductionOrders",
      "writeScheduledStopProductionOrders",
      "openProductionOrders",
      "writeProductionOrderEvents",
      "editProductionOrderEvents",
      "readProductionOrders",
      "readProductionOrderReports",
      "readPendingWaste",
      "writePendingWaste",
      "editPendingWaste"
    ],
    privilege => (userPermissions[privilege] = getPermissions({ payload, privilege }))
  );
  return userPermissions;
};

export default mapPermissions;
