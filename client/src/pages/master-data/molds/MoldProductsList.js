import React from "react";
import { Typography, Grid, Icon, Avatar } from "@material-ui/core";
import {
  Link,
  withRouter,
  withStyles,
  classNames,
  lodashGet,
  lodashMap,
  useGetService
} from "../../../utils";
import { NotFound } from "../../../components";

const styles = theme => ({
  card: {
    color: theme.palette.common.black,
    display: "flex",
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
  },
  link: {
    paddingLeft: `${theme.spacing(1)}px`,
    textDecoration: "none"
  },
  selected: {
    backgroundColor: theme.palette.primary.header
    // TODO selected item with color
    // color: theme.palette.primary.main
  },
  avatar: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main
  },
  item: {
    flexWrap: "nowrap"
  }
});

const MoldProductsList = ({ match: { params }, classes, model, mold }) => {
  const { item, loading } = useGetService({
    model: model.name,
    id: mold.id
  });
  const empty = !loading && !lodashGet(item, "products.length");
  return (
    <React.Fragment>
      {empty && <NotFound />}
      {lodashMap(item.products, product => (
        <Grid
          item
          xs={12}
          key={product.id}
          className={classNames(classes.link, {
            [classes.selected]:
              parseInt(params.moldId, "10") === mold.id &&
              parseInt(params.productId, "10") === product.id
          })}
          component={Link}
          to={`${model.formPath}/${mold.id}/products/${product.id}`}
        >
          <div className={classes.card}>
            <Grid container alignItems="center" className={classes.item}>
              {product.image && (
                <Avatar alt={product.name} src={product.image} className={classes.avatar} />
              )}
              {!product.image && model.icon && <Icon className={classes.avatar}>{model.icon}</Icon>}
              <Typography variant="body1">
                {product.identity ? `${product.identity} - ` : ""} {product.name}
              </Typography>
            </Grid>
          </div>
        </Grid>
      ))}
    </React.Fragment>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(MoldProductsList));
