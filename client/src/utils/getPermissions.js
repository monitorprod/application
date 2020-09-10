import { lodashReduce } from "./lodash";

const getPermissions = ({ privileges = [], permissions = {} }) =>
  !privileges.length ||
  lodashReduce(privileges, (query, privilege) => query || !!permissions[privilege], false);

export default getPermissions;
