import { lodashMap } from "./lodash";

const runHooks = async ({ hooks = {}, identity, data }) => {
  let continueOperation = true;
  if (hooks[identity]) {
    let hooksToRun = hooks[identity];
    if (!Array.isArray(hooksToRun)) {
      hooksToRun = [hooksToRun];
    }
    await Promise.all(
      lodashMap(hooksToRun, async hook => {
        const result = await hook({ data });
        if (continueOperation) {
          continueOperation = result;
        }
      })
    );
  }
  return continueOperation;
};

export default runHooks;
