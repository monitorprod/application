import React from "react";
import { Switch } from "../../utils";
import { AdminRoute, withMasterDataListPage, withMasterDataFormPage } from "../../components";
import SysAdminPage from "./";
import ConfigsPage from "./configs";
import LandingPage from "../landing";
import ProductionHistoryPage from "../dashboard/production-history";
import UnderConstructionPage from "../under-construction";
import {
  CompaniesModel,
  CompanyStatusesModel,
  SensorsModel,
  ColorsModel,
  MeasurementUnitsModel,
  PlantStatusesModel,
  ProductionOrderStatusesModel,
  ProductionOrderActionTypesModel,
  MachineStatusesModel,
  MoldStatusesModel,
  ProductStatusesModel,
  SensorStatusesModel,
  RolesModel,
  RoleStatusesModel,
  UserStatusesModel,
  TicketStatusesModel
} from "./models";

const SysAdminRoutes = () => (
  <React.Fragment>
    <Switch>
      <AdminRoute exact path="/sysadmin" component={() => <LandingPage title="Sys Admin" />} />
      <AdminRoute
        exact
        path="/sysadmin/companies"
        component={() => withMasterDataListPage(CompaniesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/companies/:companyId"
        component={() => withMasterDataFormPage(CompaniesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/companies/:companyId/production-history"
        component={ProductionHistoryPage}
      />
      <AdminRoute
        exact
        path="/sysadmin/sensors"
        component={() => withMasterDataListPage(SensorsModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/sensors/:sensorId"
        component={() => withMasterDataFormPage(SensorsModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/colors"
        component={() => withMasterDataListPage(ColorsModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/colors/:colorId"
        component={() => withMasterDataFormPage(ColorsModel)}
      />
      <AdminRoute exact path="/sysadmin/configs" component={ConfigsPage} />
      <AdminRoute exact path="/sysadmin/master-data" component={SysAdminPage} />
      <AdminRoute
        exact
        path="/sysadmin/master-data/measurement-units"
        component={() => withMasterDataListPage(MeasurementUnitsModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/measurement-units/:measurementUnitId"
        component={() => withMasterDataFormPage(MeasurementUnitsModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/plant-statuses"
        component={() => withMasterDataListPage(PlantStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/plant-statuses/:plantStatusId"
        component={() => withMasterDataFormPage(PlantStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/production-order-statuses"
        component={() => withMasterDataListPage(ProductionOrderStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/production-order-statuses/:productionOrderStatusId"
        component={() => withMasterDataFormPage(ProductionOrderStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/production-order-action-types"
        component={() => withMasterDataListPage(ProductionOrderActionTypesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/production-order-action-types/:productionOrderActionTypeId"
        component={() => withMasterDataFormPage(ProductionOrderActionTypesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/company-statuses"
        component={() => withMasterDataListPage(CompanyStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/company-statuses/:companyStatusId"
        component={() => withMasterDataFormPage(CompanyStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/machine-statuses"
        component={() => withMasterDataListPage(MachineStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/machine-statuses/:machineStatusId"
        component={() => withMasterDataFormPage(MachineStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/mold-statuses"
        component={() => withMasterDataListPage(MoldStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/mold-statuses/:moldStatusId"
        component={() => withMasterDataFormPage(MoldStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/product-statuses"
        component={() => withMasterDataListPage(ProductStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/product-statuses/:productStatusId"
        component={() => withMasterDataFormPage(ProductStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/sensor-statuses"
        component={() => withMasterDataListPage(SensorStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/sensor-statuses/:sensorStatusId"
        component={() => withMasterDataFormPage(SensorStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/roles"
        component={() => withMasterDataListPage(RolesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/roles/:roleId"
        component={() => withMasterDataFormPage(RolesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/role-statuses"
        component={() => withMasterDataListPage(RoleStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/role-statuses/:roleStatusId"
        component={() => withMasterDataFormPage(RoleStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/user-statuses"
        component={() => withMasterDataListPage(UserStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/user-statuses/:userStatusId"
        component={() => withMasterDataFormPage(UserStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/ticket-statuses"
        component={() => withMasterDataListPage(TicketStatusesModel)}
      />
      <AdminRoute
        exact
        path="/sysadmin/master-data/ticket-statuses/:ticketStatusId"
        component={() => withMasterDataFormPage(TicketStatusesModel)}
      />
      <AdminRoute default component={UnderConstructionPage} />
    </Switch>
  </React.Fragment>
);

export default SysAdminRoutes;
