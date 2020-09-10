import React from "react";
import { withRouter, withStyles, lodashGet, useGetService, lodashIsNil } from "../../utils";
import BreadCrumbs from "../breadcrumbs";
import MasterDataForm from "../master-data-form";

const styles = theme => ({});

const MasterDataFormPage = withRouter(
  withStyles(styles, { withTheme: true })(
    ({
      match: { params },
      classes,
      metadata,
      form,
      links,
      query = {},
      options = {},
      customContent = {},
      customActions
    }) => {
      const { item, loading, errors } = useGetService({
        model: metadata.name,
        id: lodashGet(params, metadata.paramsProp)
      });
      return (
        <React.Fragment>
          {!options.dontUseBreadcrumbs && (
            <BreadCrumbs
              links={[
                ...links,
                {
                  text: lodashGet(item, "id")
                    ? customContent.customBreadCrumbsName
                      ? customContent.customBreadCrumbsName({ data: item })
                      : item.name
                    : metadata.newItemText,
                  href: `${metadata.formPath}/${lodashGet(params, metadata.paramsProp)}`
                }
              ]}
            />
          )}
          <MasterDataForm
            model={metadata}
            fields={form}
            data={item}
            query={query}
            options={options}
            loading={loading}
            errors={errors}
            customContent={customContent}
            customActions={customActions}
          />
        </React.Fragment>
      );
    }
  )
);

const withMasterDataFormPage = ({
  metadata,
  form,
  links,
  query = {},
  options = {},
  customContent = {},
  customActions
}) => (
    <MasterDataFormPage
      metadata={metadata}
      form={form}
      links={links}
      query={query}
      options={options}
      customContent={customContent}
      customActions={customActions}
    />
  );

export default withMasterDataFormPage;
