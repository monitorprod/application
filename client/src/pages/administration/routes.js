import React from "react";
import { Switch } from "../../utils";
import { ClientRoute, withMasterDataListPage, withMasterDataFormPage } from "../../components";
import AdministrationPage from "./";
import ResetPasswordPage from "../reset-password";
import UnderConstructionPage from "../under-construction";
import AdminPlantFormPage from "./plants/Form";
import {
  AttributesModel,
  ProductionOrderTypesModel,
  ProductionOrderEventTypesModel,
  MachineTypesModel,
  NozzleTypesModel,
  PlantsModel,
  ProductMatTypesModel,
  UsersModel,
  WasteJustificationsModel
} from "./models";

const AdministrationRoutes = () => (
  <React.Fragment>
    <Switch>
      <ClientRoute exact path="/administration/reset-password" component={ResetPasswordPage} />
      <ClientRoute
        exact
        path="/administration"
        permissions={["crudAdminData", "crudUserData"]}
        component={AdministrationPage}
      />
      <ClientRoute
        exact
        path="/administration/attributes"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(AttributesModel)}
      />
      <ClientRoute
        exact
        path="/administration/attributes/:attributeId"
        permissions={["crudAdminData"]}
        component={() => withMasterDataFormPage(AttributesModel)}
      />
      <ClientRoute
        exact
        path="/administration/production-order-types"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(ProductionOrderTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/production-order-types/:productionOrderTypeId"
        permissions={["crudAdminData"]}
        component={() => withMasterDataFormPage(ProductionOrderTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/production-order-event-types"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(ProductionOrderEventTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/production-order-event-types/:productionOrderEventTypeId"
        permissions={["crudAdminData"]}
        component={() => withMasterDataFormPage(ProductionOrderEventTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/plants"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(PlantsModel)}
      />
      <ClientRoute
        exact
        path="/administration/plants/:plantId"
        permissions={["crudAdminData"]}
        component={AdminPlantFormPage}
      />
      <ClientRoute
        exact
        path="/administration/machine-types"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(MachineTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/machine-types/:machineTypeId"
        permissions={["crudAdminData"]}
        component={() => withMasterDataFormPage(MachineTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/nozzle-types"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(NozzleTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/nozzle-types/:nozzleTypeId"
        permissions={["crudAdminData"]}
        component={() => withMasterDataFormPage(NozzleTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/product-mat-types"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(ProductMatTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/product-mat-types/:productMatTypeId"
        permissions={["crudAdminData"]}
        component={() => withMasterDataFormPage(ProductMatTypesModel)}
      />
      <ClientRoute
        exact
        path="/administration/users"
        permissions={["crudUserData"]}
        component={() => withMasterDataListPage(UsersModel)}
      />
      <ClientRoute
        exact
        path="/administration/users/:userId"
        permissions={["crudUserData"]}
        component={() => withMasterDataFormPage(UsersModel)}
      />
      <ClientRoute
        exact
        path="/administration/waste-justifications"
        permissions={["crudAdminData"]}
        component={() => withMasterDataListPage(WasteJustificationsModel)}
      />
      <ClientRoute
        exact
        path="/administration/waste-justifications/:wasteJustificationId"
        permissions={["crudAdminData"]}
        component={() => withMasterDataFormPage(WasteJustificationsModel)}
      />
      <ClientRoute default component={UnderConstructionPage} />
    </Switch>
  </React.Fragment>
);

export default AdministrationRoutes;
