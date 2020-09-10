import React from "react";
import { Switch } from "../../utils";
import { ClientRoute, withMasterDataListPage, withMasterDataFormPage } from "../../components";
import MasterDataPage from "./";
import UnderConstructionPage from "../under-construction";
import MasterDataMoldsFormPage from "./molds/Form";
import MasterDataMoldProductsFormPage from "./molds/MoldProductForm";
import { MachinesModel, MoldsModel, ProductsModel, SensorsModel, SetupsModel } from "./models";

const MasterDataRoutes = () => (
  <React.Fragment>
    <Switch>
      <ClientRoute
        exact
        path="/master-data"
        permissions={["readMasterData", "writeMasterData"]}
        component={MasterDataPage}
      />
      <ClientRoute
        exact
        path="/master-data/machines"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataListPage(MachinesModel)}
      />
      <ClientRoute
        exact
        path="/master-data/machines/:machineId"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataFormPage(MachinesModel)}
      />
      <ClientRoute
        exact
        path="/master-data/molds"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataListPage(MoldsModel)}
      />
      <ClientRoute
        exact
        path="/master-data/molds/:moldId"
        permissions={["readMasterData", "writeMasterData"]}
        component={MasterDataMoldsFormPage}
      />
      <ClientRoute
        exact
        path="/master-data/molds/:moldId/products/:productId"
        permissions={["readMasterData", "writeMasterData"]}
        component={MasterDataMoldProductsFormPage}
      />
      <ClientRoute
        exact
        path="/master-data/products"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataListPage(ProductsModel)}
      />
      <ClientRoute
        exact
        path="/master-data/products/:productId"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataFormPage(ProductsModel)}
      />
      <ClientRoute
        exact
        path="/master-data/sensors"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataListPage(SensorsModel)}
      />
      <ClientRoute
        exact
        path="/master-data/sensors/:sensorId"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataFormPage(SensorsModel)}
      />
      <ClientRoute
        exact
        path="/master-data/setups"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataListPage(SetupsModel)}
      />
      <ClientRoute
        exact
        path="/master-data/setups/:setupId"
        permissions={["readMasterData", "writeMasterData"]}
        component={() => withMasterDataFormPage(SetupsModel)}
      />
      <ClientRoute default component={UnderConstructionPage} />
    </Switch>
  </React.Fragment>
);

export default MasterDataRoutes;
