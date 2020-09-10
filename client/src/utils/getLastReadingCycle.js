import { lodashGet } from "./lodash";

const getLastReadingCycle = ({ data: productionOrder }) => {
  let lastReading =
    lodashGet(productionOrder, "lastReading.0") ||
    lodashGet(productionOrder, "mostRecentEvent.0") ||
    [];
  const totalReadingsTime =
    lodashGet(lastReading, "tr") > 0 ? lodashGet(lastReading, "r.length") || 0 : 0;
  return (totalReadingsTime * 60) / (lodashGet(lastReading, "tr") || 1);
};

export default getLastReadingCycle;
