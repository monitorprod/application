import React from "react";
import { withStyles } from "../../utils";
import BreadCrumbs from "../breadcrumbs";
import MasterDataList from "../master-data-list";

const styles = theme => ({});

const MasterDataListPage = withStyles(styles, { withTheme: true })(
  ({
    classes,
    metadata,
    list,
    links,
    query = {},
    options = {},
    customContent = {},
    customActions
  }) => (
    <React.Fragment>
      <BreadCrumbs links={links} />
      <MasterDataList
        model={metadata}
        fields={list}
        query={query}
        options={options}
        customContent={customContent}
        customActions={customActions}
      />
    </React.Fragment>
  )
);

const withMasterDataListPage = ({
  metadata,
  list,
  links,
  query = {},
  options = {},
  customContent = {},
  customActions
}) => (
  <MasterDataListPage
    metadata={metadata}
    list={list}
    links={links}
    query={query}
    options={options}
    customContent={customContent}
    customActions={customActions}
  />
);

export default withMasterDataListPage;
