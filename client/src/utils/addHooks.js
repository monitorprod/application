const addHooks = ({ hooks, identity, hooksToAdd }) => {
  let targetHooks = hooks[identity] || [];
  if (!Array.isArray(targetHooks)) {
    targetHooks = [targetHooks];
  }
  let sourceHooks = hooksToAdd || [];
  if (!Array.isArray(sourceHooks)) {
    sourceHooks = [];
  }
  return {
    ...hooks,
    [identity]: [...targetHooks, ...sourceHooks]
  };
};

export default addHooks;
