import React, { useContext, useState, useEffect } from "react";
import { Grid } from "@material-ui/core";
import ApiContext from "../../api";
import {
  withStyles,
  lodashGet,
  lodashMap,
  getPermissions,
  validateForm,
  useFindService,
  useAuth
} from "../../utils";
import { form as fields } from "./model";
import NewWikiSection from "./NewWikiSection";
import WikiSectionPanel from "./WikiSectionPanel";

const styles = theme => ({});

const WikiPageWikiSectionsTable = ({ classes, wikiPage, options = {} }) => {
  const { permissions } = useAuth();
  const client = useContext(ApiContext);
  const query = {
    wikiPageId: wikiPage.id
  };
  const { list, reload, setQuery } = useFindService({
    model: "wiki_sections",
    query: {
      ...query,
      $populateAll: true
    }
  });
  const stringQuery = JSON.stringify(query);
  useEffect(() => {
    setQuery(prev => ({ ...prev, ...JSON.parse(stringQuery) }));
  }, [stringQuery, setQuery]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState({});
  const handleExpand = ({ id }) => () => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const resetList = () => {
    reload();
  };
  const handleSubmit = async ({
    wikiSection,
    setFormErrors = () => {},
    resetForm = () => {}
    // TODO add validation default json to all functions?
  } = {}) => {
    setLoading(prev => ({ ...prev, [wikiSection.id || "new"]: true }));
    setFormErrors({});
    let continueOperation = true;
    const newWikiSection = {
      ...query,
      ...wikiSection,
      id: lodashGet(wikiSection, "id")
    };
    if (
      !validateForm({
        fields,
        formItem: newWikiSection,
        setFormErrors
      })
    ) {
      continueOperation = false;
    }
    if (!continueOperation) {
      setLoading(prev => ({ ...prev, [wikiSection.id || "new"]: false }));
      return;
    }
    await client.service("wiki_pages").patch(wikiPage.id, {
      wiki_sections: [newWikiSection]
    });
    resetList();
    resetForm();
    setLoading(prev => ({ ...prev, [wikiSection.id || "new"]: false }));
  };
  const handleDelete = async ({ wikiSection }) => {
    if (!window.confirm("Você quer apagar o item?")) {
      return;
    }
    await client.service("wiki_sections").remove(null, {
      query: {
        ...query,
        id: wikiSection.id
      }
    });
    resetList();
  };
  const hasWriteAccess = getPermissions({ privileges: options.writePermissions, permissions });
  return (
    <React.Fragment>
      <Grid item>
        {lodashMap(list, (wikiSection, index) => (
          <WikiSectionPanel
            key={index}
            wikiSection={wikiSection}
            loading={loading}
            expanded={expanded}
            handleExpand={handleExpand}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            options={{
              readOnly: !hasWriteAccess || options.readOnly
            }}
          />
        ))}
      </Grid>
      {hasWriteAccess && !options.readOnly && (
        <Grid item>
          <NewWikiSection
            loading={loading}
            expanded={expanded}
            handleExpand={handleExpand}
            handleSubmit={handleSubmit}
            options={{
              readOnly: !hasWriteAccess || options.readOnly
            }}
          />
        </Grid>
      )}
    </React.Fragment>
  );
};

export default withStyles(styles, { withTheme: true })(WikiPageWikiSectionsTable);
