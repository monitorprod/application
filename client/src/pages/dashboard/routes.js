import React from "react";
import { Switch } from "react-router-dom";
import DashboardPage from "./";
import ReportsPage from "./index2";
import ProductionPage from "./production";
import ProductionOrderPage from "./production/production-order";
import ProductionWastePage from "./production-waste";
import ProductionReportPage from "./production-report";
import ProductionHistoryPage from "./production-history";
import CarouselPage from "./CarouselPage";
import ProductionOEEPage from "./production-oee";
import UnderConstructionPage from "../under-construction";
import { ClientRoute } from "../../components";

const MasterDataRoutes = () => (
  <React.Fragment>
    <Switch>
      <ClientRoute
        exact
        path="/reports/carousel"
        permissions={[
          "readProductionOrders",
          "readProductionOrderReports",
          "writeActiveProductionOrders",
          "writeScheduledStopProductionOrders",
          "writeProductionOrderEvents"
        ]}
        component={CarouselPage}
      />
      <ClientRoute
        exact
        path="/dashboard"
        permissions={[
          "readProductionOrders",
          "readProductionOrderReports",
          "writeActiveProductionOrders",
          "writeScheduledStopProductionOrders",
          "writeProductionOrderEvents"
        ]}
        component={DashboardPage}
      />
      <ClientRoute
        exact
        path="/reports"
        permissions={["readProductionOrderReports"]}
        component={ReportsPage}
      />
      <ClientRoute
        exact
        path="/dashboard/production"
        permissions={[
          "readProductionOrders",
          "writeActiveProductionOrders",
          "writeScheduledStopProductionOrders",
          "writeProductionOrderEvents"
        ]}
        component={ProductionPage}
      />
      <ClientRoute
        exact
        path="/dashboard/production/:machineId/order/:productionOrderId"
        permissions={[
          "readProductionOrders",
          "writeActiveProductionOrders",
          "writeScheduledStopProductionOrders",
          "writeProductionOrderEvents"
        ]}
        component={ProductionOrderPage}
      />
      <ClientRoute
        exact
        path="/dashboard/production-waste"
        permissions={["readPendingWaste", "writePendingWaste", "editPendingWaste"]}
        component={ProductionWastePage}
      />
      <ClientRoute
        exact
        path="/dashboard/production-waste/:machineId/order/:productionOrderId"
        permissions={["readPendingWaste", "writePendingWaste", "editPendingWaste"]}
        component={ProductionWastePage}
      />
      <ClientRoute
        exact
        path="/dashboard/production-history"
        permissions={["readProductionOrderReports"]}
        component={ProductionHistoryPage}
      />
      <ClientRoute
        exact
        path="/reports/production-report"
        permissions={["readProductionOrderReports"]}
        component={ProductionReportPage}
      />
      <ClientRoute
        exact
        path="/reports/production-oee"
        permissions={["readProductionOrderReports"]}
        component={ProductionOEEPage}
      />
      <ClientRoute
        exact
        path="/reports/production-oee/plant/:plantId"
        permissions={["readProductionOrderReports"]}
        component={ProductionOEEPage}
      />
      <ClientRoute
        exact
        path="/reports/production-oee/plant/:plantId/machine/:machineId"
        permissions={["readProductionOrderReports"]}
        component={ProductionOEEPage}
      />
      <ClientRoute default component={UnderConstructionPage} />
    </Switch>
  </React.Fragment>
);

export default MasterDataRoutes;
