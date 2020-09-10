import React, { useEffect, useContext } from 'react';
import {
  lodashMap,
  useFindService
} from '../../utils';

import { Loader, NotFound } from "..";
import NotificationMessageItem from './NotificationMessageItem';
import ApiContext from '../../api';

const TreeSupportItem = ({ company, isAdminApp, type, withoutClosedTickets }) => {

  const client = useContext(ApiContext);

  const { list: listTicket, loading: loadingTicket, reload: reloadTicket } = useFindService({
    model: "tickets",
    query: {
      $populateAll: true,
      companyId: company.id,
      $sort: {
        createdAt: -1
      }
    }
  });

  const empty = !loadingTicket && !listTicket.length;

  return (
    <React.Fragment>
      {empty && <NotFound />}
      {loadingTicket && <Loader />}
      {lodashMap(listTicket, ticket => (        
        <NotificationMessageItem isAdminApp={isAdminApp} key={ticket.id} ticket={ticket} type={type} withoutClosedTickets={withoutClosedTickets} reloadTicket={reloadTicket}/>
      ))}
    </React.Fragment>
  );
}

export default TreeSupportItem;