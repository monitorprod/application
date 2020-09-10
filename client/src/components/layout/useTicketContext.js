import { useState, useContext, useEffect } from "react";
import {
    lodashMap,
    lodashGet,
    lodashFilter,
    useFindService
  } from "../../utils"
import ApiContext from "../../api";

const useTicketContext = ({session}) =>{

const client = useContext(ApiContext);
const [connected, setConnected] = useState(false);

client.socket.on('connect', () => setConnected(true) );

const userId = lodashGet(session, 'userId')
const companyId = lodashGet(session, 'companyId')

const { list: tickets, reload: reloadTicket } = useFindService({
    model: "tickets",
    query: {
      $populateAll: true,
      $sort: {
        createdAt: -1
      }
    }
  });

  const { list: unreadMessages, reload: reloadMessages, setQuery: setQueryMessages } = useFindService({
    model: "ticket_messages"
  });

  useEffect(()=> {  
    // console.log('conectou no TicketContext')  
    client.service("tickets").on("created", () => {
      reloadTicket()})
  } ,[connected]);
  
  useEffect(() => {
    setQueryMessages({
      ticketId: {
        $in: lodashMap(tickets, t => t.id)
      },
      viewedAt: null,
      companyId: companyId
    })
  }, [tickets, companyId, setQueryMessages])

  useEffect(() => {
    client.service("ticket_messages").on("created", () =>{console.log('nova mensagem...'); reloadMessages()});
  }, [connected,reloadMessages]);

  let userUnreadMessages = lodashFilter(unreadMessages, ticket => ticket.userId !== userId) || []

  // console.log( userUnreadMessages);

  return {userUnreadMessages};
}
export default useTicketContext;