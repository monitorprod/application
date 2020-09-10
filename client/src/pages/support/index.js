import React, { useEffect, useContext } from "react";
import { Grid } from "@material-ui/core";
import {
  withStyles,
  useAuth,
  useGetService,
  useFindService,
  lodashGet,
  lodashDebounce,
} from "../../utils";
import {
  MasterDataForm,
  ChatSupport,
} from "../../components";
import TicketModel from "./tickets/model";

import ApiContext from "../../api";
import TicketList from '../../components/layout/TicketsList';

const styles = theme => ({
  logo: {
    width: 250,
  },
  headerLogo: {
    textAlign: "center"
  },
  tree: {
    height: '100%',
    width: "25%",
    overflowY: "auto",
    overflowX: "hidden"
  },
  wrapper: {
    borderLeft: 'solid 2px #00000075',
    //backgroundColor: 'pink',
    flex: 1,
    overflowX: "auto",
    display: 'flex',
    flexDirection:'column',
  },
  container: {
    margin: '-24px',
    width: 'calc(100% + 48px)',
    height: 'calc(100% + 48px)',
    overflow: 'overlay',    
    //backgroundColor: 'purple',
  },
  containerButton: {
    //backgroundColor: 'red',
    padding: '6px 16px',
    minHeight: 44,
    marginBottom: theme.spacing(2)
  }
});

const Support = ({ classes, match: { params } }) => {

  const client = useContext(ApiContext);

  const { session } = useAuth();
  const isAdminApp = lodashGet(session, "isAdmin");

  const {
    item: ticketItem,
    loading: ticketLoading,
    errors: ticketErrors,
    reload
  } = useGetService({
    model: "tickets",
    id: params.ticketId
  })

  const { list: listTicket, reload: reloadTicket } = useFindService({
    model: "tickets",
    query: {
      $populateAll: true,
      $sort: {
        createdAt: -1
      }
    }
  });

  useEffect(() => {
    const onNewEvent = lodashDebounce(() => reload(), 300);
    const onPatched = data => {
      if (`${data.id}` === `${params.ticketId}`) {
        onNewEvent();
      }
    };
    client.service("tickets").on("patched", onPatched);
    return () =>
      client.service("tickets").removeListener("patched", onPatched);
  }, [client, params.ticketId, reload]);

  return (
    <Grid container  className={classes.container}>
        <TicketList isAdminApp={isAdminApp} />
      <Grid item className={classes.wrapper}>
        {ticketItem && 
          <ChatSupport id='chat' ticket={ticketItem} session={session} data={ticketItem}/>
        }
        {!ticketItem &&  !isAdminApp &&
        <div style={{margin: '24px'}}>
          <MasterDataForm
            model={TicketModel.metadata}
            fields={TicketModel.form}
            data={ticketItem}
            formErrors={ticketErrors}
            loading={ticketLoading}
            options={{
              dontDelete: true,
              dontCreate: true,
              chatSupport: true,
              isAdmin: isAdminApp,
              dontShowTree: true,
              dontUseEnter: true
            }}
            hooks={{
              "afterSubmit": [
                (() => {
                  reload()
                  reloadTicket()
                })
              ]
            }}
          />
          </div>
      }
      </Grid>
    </Grid>
  )
}

export default withStyles(styles, { withTheme: true })(Support);