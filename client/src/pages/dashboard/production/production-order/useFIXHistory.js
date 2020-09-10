import { useContext, useEffect } from "react";
import ApiContext from "../../../../api";
import { lodashGet, lodashReduce } from "../../../../utils";

const useFIXHistory = ({ classes, productionOrderId }) => {
  const client = useContext(ApiContext);
  const productionOrderIdQuery = { $in: [parseInt(productionOrderId), `${productionOrderId}`] };
  const stringQuery = JSON.stringify(productionOrderIdQuery);
  useEffect(() => {
    const parsedQuery = JSON.parse(stringQuery);
    const fixHistory = async ({ update, clean, create, src, target } = {}) => {
      let { data: targetHistory } = await client.service("production_order_history").find({
        query: {
          poi: target || parsedQuery
        }
      });
      targetHistory = lodashGet(targetHistory, "0");
      if (clean && targetHistory) {
        console.log("...clear targetHistory");
        await client.service("production_order_history").patch(targetHistory._id, {
          ev: []
        });
      }
      // let { data: events } = await client.service("production_order_events").find({
      //   query: {
      //     poi: src || parsedQuery
      // "r.0": { $exists: true },
      // w: null,
      // $sort: {
      //   sd: 1
      // }
      // $skip: 820
      // $limit: 20
      //   }
      // });
      // const offset = events.length - 700;
      // if (offset > 0) {
      // events = events.slice(offset);
      // }
      // events = events.slice(-10);
      // window.localStorage.setItem("events", JSON.stringify(events));
      const events = JSON.parse(window.localStorage.getItem("events"));
      console.log("!!!events", events);
      if (create || update) {
        console.log("...fix targetHistory");
        try {
          lodashReduce(
            events,
            async (promise, ev, index) => {
              try {
                await promise;
              } catch (error) {
                console.log("FIX HISTORY ERROR", error);
              }
              console.log("!!! REDUCE", index);
              if (create) {
                delete ev._id;
                return client.service("production_order_events").create({
                  ...ev,
                  poi: targetHistory.poi,
                  mi: targetHistory.mi,
                  si: targetHistory.si
                });
              } else {
                return client.service("production_order_events").patch(ev._id, { ...ev });
              }
            },
            Promise.resolve()
          );
        } catch (error) {
          console.log("FIX HISTORY ERROR", error);
        }
      }
    };
    window.fixHistory = fixHistory;
    fixHistory();
  }, [client, stringQuery]);
};

export default useFIXHistory;
