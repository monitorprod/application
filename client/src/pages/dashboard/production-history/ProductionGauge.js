/* eslint-disable import/first */
import React, { useState } from "react";
import Chartist from "chartist";
import { Modal } from "@material-ui/core";
import ChartistGraph from "react-chartist";
import "chartist-plugin-tooltips";
import "../chartist-plugin-tooltip.css";
import "./change-event-plugin";
import "chartist/dist/chartist.css";
import StatusLine from "../production/production-order/StatusLine"
import {
  withStyles, getPermissions,
  useAuth
} from "../../../utils";
import "./gauge.css";
import { lodashForEach } from "../../../utils/lodash";

const styles = theme => ({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
  },
  wrapper: {
    width: "500px",
    padding: theme.spacing(2),
    background: theme.palette.secondary.main,
  }
});

const ProductionGauge = ({ classes, filters, typesMap, data, header, reload }) => {
  const { permissions } = useAuth();
  const hasEditAccess = getPermissions({
    privileges: ["editProductionOrderEvents"],
    permissions
  });
  const [showModal, setShowModal] = useState(false);
  const [event, setEvent] = useState({});
  const options = {
    stackBars: true,
    horizontalBars: true,
    height: header ? "50px" : "80px",
    low: 0,
    high: 1440,
    classNames: {
      label: "myct-label"
    },
    axisX: {
      offset: header ? 100 : 10,
      showLabel: header ? true : false,
      type: Chartist.FixedScaleAxis,
      divisor: header ?
        window.innerWidth > 1400 ? 24 : window.innerWidth > 800 ? 12 : window.innerWidth > 400 ? 6 : 3
        :
        window.innerWidth > 1400 ? 24 * 2 : window.innerWidth > 800 ? 12 * 2 : window.innerWidth > 400 ? 6 * 2 : 3 * 2,
      showGrid: true,
      labelInterpolationFnc: (value, index, array) => {
        if (header) {
          //TODO: get first working hour of the day from location settings
          // console.log(value,array);
          if (value % 60 === 0) {
            return filters.sd
              .clone()
              .add(6, "hours")
              .add(value, "m")
              .format("HH:mm");
          }
        }
        return "";
      }
    },
    axisY: {
      showGrid: false,
      showLabel: false
    },
    plugins: [
      Chartist.plugins.tooltip({
        appendToBody: true,
        class: "gauge-tooltip",
        transformTooltipTextFnc: () => { }
      }),
      Chartist.plugins.changeEvent({
        onClick: (event) => {
          const ev = JSON.parse(event.target.getAttribute('ct:ev') || '{}');
          setEvent(ev)
          // lodashForEach(document.querySelectorAll(".tooltip-show"), t => t.remove())
          setShowModal(true)
        }
      })
    ]
  };
  const fillBarColor = {
    draw: context => {
      if (context.series) {
        context.element.attr({
          style: "stroke:" + context.series.bgColor,
          "ct:ev": JSON.stringify(context.series)
        });
      }
    }
  };
  const onClose = () => {
    setShowModal(false)
  }
  return (
    <>
      <ChartistGraph
        type="Bar"
        data={data || {}}
        options={options}
        listener={fillBarColor}
        style={{
          marginBottom: "-18px",
          marginTop: header ? "" : "-15px",
          marginLeft: "-35px",
          position: "relative",
          top: header ? "-18px" : "",
          overflowY: header ? "hidden" : ""
        }}
      />
      <Modal
        style={{ zIndex: 10 }}
        open={showModal}
        onClose={onClose}
      >
        <div className={classes.container} onClick={onClose}>
          <div className={classes.wrapper} onClick={(e) => e.stopPropagation()}>
            <StatusLine
              index={event.evIndex}
              hasEditAccess={hasEditAccess}
              history={{ _id: event.sum }}
              typesMap={typesMap}
              event={event}
              reload={() => {
                onClose()
                reload()
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default withStyles(styles, { withTheme: true })(ProductionGauge);
