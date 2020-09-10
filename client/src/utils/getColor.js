import { lodashGet } from "./lodash";

const getColor = ({ data, path }) =>
  lodashGet(data, `${path}.hex`) ||
  lodashGet(data, `${path}.rgb`) ||
  lodashGet(data, `${path}.hsv`);

export default getColor;
