import React from "react";
import { Grid } from "@material-ui/core";
import {
  classNames,
  withStyles,
  lodashGet,
  lodashMap,
  useAuth
} from "../../utils";
import { MasterDataCard } from "../../components";
// import machinesIcon from "../../icons/injector.svg";
// import moldsIcon from "../../icons/mold.svg";
import { MachineIcon , MoldIcon} from "../../utils/svgIcons";


const styles = theme => ({
  disabled: {
    pointerEvents: "none",
    background: "lightgrey"
  },
  icon:{
    color: theme.palette.type === "dark"? theme.palette.common.white : theme.palette.primary.main,
    fontSize: 50
  }
});


const actions = ({ level,classes }) => [
  {
    name: "Máquinas",
    // icon: { type: "svg", src: machinesIcon },
    svgIcon: <MachineIcon className={classes.icon} />,// style={{ fontSize: 50, color: "#424242" }} />,
    href: "/master-data/machines"
  },
  {
    name: "Moldes",
    svgIcon: <MoldIcon className={classes.icon}/>,
    href: "/master-data/molds"
  },
  {
    name: "Produtos",
    icon: "style",
    href: "/master-data/products",
    disabled: level !== "N1"
  },
  {
    name: "Sensores",
    icon: "memory",
    href: "/master-data/sensors"
  },
  {
    name: "Tempos de Configuração",
    icon: "access_time",
    href: "/master-data/setups",
    disabled: level !== "N1"
  }
];

const MasterDataPage = ({ classes }) => {
  const { session } = useAuth();
  const level = lodashGet(session, "company.level");
  return (
    <Grid container spacing={1}>
      {lodashMap(
        actions({ level, classes }),
        ({ name, icon, svgIcon, description, href, disabled }) => (
          <Grid
            item
            xs={12}
            sm={6}
            lg={4}
            key={name}
            className={classNames({ [classes.disabled]: disabled })}
          >
            <MasterDataCard
              name={name}
              description={description}
              icon={icon}
              svgIcon={svgIcon}
              href={href}
            />
          </Grid>
        )
      )}
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(MasterDataPage);
