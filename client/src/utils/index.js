import { Redirect as eRedirect } from "react-router";
import {
  BrowserRouter as eBrowserRouter,
  Route as eRoute,
  Link as eLink,
  Switch as eSwitch,
} from "react-router-dom";
import { withRouter as eWithRouter } from "react-router";
import { withStyles as eWithStyles } from "@material-ui/styles";
import eClassNames from "classnames";
import {
  lodashGet as eLodashGet,
  lodashMap as eLodashMap,
  lodashForEach as eLodashForEach,
  lodashFilter as eLodashFilter,
  lodashReduce as eLodashReduce,
  lodashFind as eLodashFind,
  lodashFindIndex as eLodashFindIndex,
  lodashIsNil as eLodashIsNil,
  lodashSplit as eLodashSplit,
  lodashDeburr as eLodashDeburr,
  lodashDebounce as eLodashDebounce,
  lodashToUpper as eLodashToUpper,
  lodashUpperFirst as eLodashUpperFirst,
  lodashToLower as eLodashToLower,
  lodashTrim as eLodashTrim,
  lodashFlattenDeep as eLodashFlattenDeep,
  lodashFill as eLodashFill,
} from "./lodash";
import * as eFormatNumber from "format-number";
import eAddHooks from "./addHooks";
import eValidateForm from "./validateForm";
import eGetColor from "./getColor";
import eGetConfigs from "./getConfigs";
import eGetEventType from "./getEventType";
import eGetDateJSON from "./getDateJSON";
import eGetLastReadingCycle from "./getLastReadingCycle";
import eGetPermissions from "./getPermissions";
import eMapPermissions from "./mapPermissions";
import eLogin from "./login";
import eLogout from "./logout";
import eUseAuth from "./useAuth";
import eUseUpsertService from "./useUpsertService";
import eUseDeleteService from "./useDeleteService";
import eUseFindService from "./useFindService";
import eUseGetService from "./useGetService";
import eUseFindDeleteService from "./useFindDeleteService";
import eUseStatusSensor from "./useStatusSensor";
import eUseSensorAllURL from "./useSensorAllURL";

export const Redirect = eRedirect;
export const BrowserRouter = eBrowserRouter;
export const Route = eRoute;
export const Link = eLink;
export const Switch = eSwitch;
export const withRouter = eWithRouter;
export const withStyles = eWithStyles;
export const classNames = eClassNames;
export const lodashGet = eLodashGet;
export const lodashMap = eLodashMap;
export const lodashForEach = eLodashForEach;
export const lodashFilter = eLodashFilter;
export const lodashReduce = eLodashReduce;
export const lodashFind = eLodashFind;
export const lodashFindIndex = eLodashFindIndex;
export const lodashIsNil = eLodashIsNil;
export const lodashSplit = eLodashSplit;
export const lodashDeburr = eLodashDeburr;
export const lodashDebounce = eLodashDebounce;
export const lodashToUpper = eLodashToUpper;
export const lodashUpperFirst = eLodashUpperFirst;
export const lodashToLower = eLodashToLower;
export const lodashTrim = eLodashTrim;
export const lodashFlattenDeep = eLodashFlattenDeep;
export const lodashFill = eLodashFill;
export const formatNumber = eFormatNumber;
export const NUMBER_FORMAT = formatNumber({
  integerSeparator: ".",
  decimal: ",",
});
export const addHooks = eAddHooks;
export const validateForm = eValidateForm;
export const getColor = eGetColor;
export const getConfigs = eGetConfigs;
export const getEventType = eGetEventType;
export const getDateJSON = eGetDateJSON;
export const getLastReadingCycle = eGetLastReadingCycle;
export const getPermissions = eGetPermissions;
export const mapPermissions = eMapPermissions;
export const login = eLogin;
export const logout = eLogout;
export const useAuth = eUseAuth;
export const useUpsertService = eUseUpsertService;
export const useDeleteService = eUseDeleteService;
export const useFindService = eUseFindService;
export const useGetService = eUseGetService;
export const useFindDeleteService = eUseFindDeleteService;
export const useStatusSensor = eUseStatusSensor;
export const useSensorAllURL = eUseSensorAllURL;
