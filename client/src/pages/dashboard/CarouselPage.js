import React, { useContext } from "react";
import Slider from "react-slick";
import { withStyles, getPermissions, useAuth, useFindService, lodashMap, lodashFill, lodashGet } from "../../utils";
import ProductionPage from "./production";
import ProductionHistoryPage from "./production-history";
import ProductionOEEPage from "./production-oee";
import ApiContext from '../../api';
import "./slick.min.css";
import "./slick-theme.min.css";

const styles = theme => ({
  container: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 9999,
    background: "white",
    padding: 0,
    "&>div": {
      height: "100%",
      "&>div": {
        height: "100%",
        "&>div": {
          height: "100%",
          "&>div": {
            height: "100%",
            "&>div": {
              height: "100%"
            }
          }
        }
      }
    }
  },
  wrapper: {
    pointerEvents: "none",
    height: "100%",
    "&>div": {
      padding: "24px 24px"
    }
  }
});

const CarouselPage = ({ classes }) => {

  const client = useContext(ApiContext);

  const { permissions } = useAuth();

  const { list: listMachines } = useFindService({
    model: "machines",
    query: {
      machineStatusId: lodashGet(
        client.get("config.machine.status.active"),
        "value"
      )
    }
  })

  const hasProductionOrdersAccess = getPermissions({
    privileges: [
      "readProductionOrders",
      "writeActiveProductionOrders",
      "writeScheduledStopProductionOrders",
      "writeProductionOrderEvents"
    ],
    permissions
  });
  const hasReportsAccess = getPermissions({
    privileges: ["readProductionOrderReports"],
    permissions
  });

  const totalPages = (total) => {
    return Math.ceil(listMachines.length / total);
  }

  let pagesProduction = new Array(totalPages(8))
  lodashFill(pagesProduction, 1, 0, totalPages(8))

  let pagesProductionHistory = new Array(totalPages(7))
  lodashFill(pagesProductionHistory, 1, 0, totalPages(7))

  return (
    <div className={classes.container}>
      <Slider
        {...{
          dots: false,
          infinite: true,
          autoplay: true,
          autoplaySpeed: 15 * 1000,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1
        }}
      >
        {hasReportsAccess && (
          lodashMap(pagesProductionHistory, (pageProductionHistory, index) =>
            <div className={classes.wrapper} key={index}>
              <ProductionHistoryPage timeCarousel={10} offset={7 * index} limit={7} />
            </div>
          )
        )}
        {hasReportsAccess && (
          <div className={classes.wrapper}>
            <ProductionOEEPage timeCarousel={20} />
          </div>
        )}
        {hasProductionOrdersAccess && (
          lodashMap(pagesProduction, (pageProduction, index) =>
            <div className={classes.wrapper} key={index}>
              <ProductionPage offset={8 * index} limit={8} />
            </div>
          )
        )}
      </Slider>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(CarouselPage);
