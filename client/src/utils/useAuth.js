import { useContext, useState, useEffect } from "react";
import ApiContext from "../api";
import login from "./login";
import getConfigs from "./getConfigs";
import getPermissions from "./getPermissions";
import mapPermissions from "./mapPermissions";

const useAuth = ({ dependencies = [], privileges = [] } = {}) => {
  const client = useContext(ApiContext);
  const [session, setSesstion] = useState();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const [hasAccess, setHasAccess] = useState(false);
  const stringPrivileges = JSON.stringify(privileges);
  const stringDependencies = JSON.stringify(dependencies);
  useEffect(() => {
    const parsedPrivileges = JSON.parse(stringPrivileges);
    // const parsedDependencies = JSON.parse(stringDependencies);
    const authenticate = async () => {
      setLoading(true);
      try {
        const payload = await login({ client });
        await getConfigs({ client });
        setSesstion(payload);
        const userPermissions = mapPermissions({ payload });
        setPermissions(userPermissions);
        if (!parsedPrivileges.length) {
          setHasAccess(true);
        } else {
          setHasAccess(
            getPermissions({ privileges: parsedPrivileges, permissions: userPermissions })
          );
        }
      } catch (error) {
        setSesstion();
      } finally {
        setLoading(false);
      }
    };
    // console.log(">>> effect AUTH");
    authenticate();
  }, [client, stringPrivileges, stringDependencies]);
  return { session, loading, permissions, hasAccess };
};

export default useAuth;
