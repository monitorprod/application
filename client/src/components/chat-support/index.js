import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  lodashMap,
  lodashGet,
  useFindService,
  validateForm,
  withStyles,
  withRouter
} from '../../utils';
import { Typography, AppBar, Toolbar, List } from '@material-ui/core';
import Message from './message';
import ApiContext from '../../api';
import Input from './Input';

const styles = theme => ({
  appbarRoot: {
    zIndex: "auto"
  },
  root: {
    width: "inherit",
    overflowX: "auto",
    paddingBottom: 0,
    paddingTop: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: 'calc(100vh - 177px)',
  },
  question: {},
  response: {
    textAlign: "end"
  },
  inline: {
    display: "inline"
  },
  subheader: {
    backgroundColor: "#ffb300",
    color: "#424242",
    top: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "150px",
    borderRadius: "50px",
    height: "30px",
    lineHeight: "30px",
    textAlign: "center"
  },
  urgent: {
    color: 'red'
  }
})

const ChatSupport = ({ classes, ticket, session, data, match: { params } }) => {
  // Get API
  const client = useContext(ApiContext);
  // Ticket ID is closed
  const ticketClosed = lodashGet(client.get("config.ticket.status.closed"), "value");
  // Ticket Status
  const status = lodashGet(ticket, "ticket_status.name");

  // Chat Scroll Reference
  const scrollRef = useRef(null);

  // Track Forms
  const [loading, setLoading] = useState({});
  const [connected, setConnected] = useState(null);
  const [formItem, setFormItem] = useState({text: ""});
  const [formErrors, setFormErrors] = useState({});
  const [listMessages, setListMessages] = useState([]);
  const resetForm = () => {
    setFormErrors({});
    setFormItem({
      text: ""
    });
  };

  client.socket.on('connect', () => setConnected(true) );

  useEffect(() => {
    const newMessage = message => {
      console.log(message); //verificar se é o mesmo id
      setListMessages(prev => ([ ...prev, prev[listMessages.length + 1] = message ]))
    }
    client.service("ticket_messages").on("created", newMessage);
//    client.service("ticket_messages").on("patched", () => {});

  }, [connected]);

  // Instantiating ticket messages
  const query = {
    ticketId: ticket.id
  }
  const { list, reload: reloadMessages, setQuery: setQueryMessages, loading: loadingMessages } = useFindService({
    model: "ticket_messages",
    query: {
      $markAsViewed: {
        viewedAt: null
      },
    }
  })

  useEffect(() => {
    console.log('nova mensagem não lida');
		setListMessages(list)
	}, [list])

  const stringQuery = JSON.stringify(query);
  useEffect(() => {
    setQueryMessages(prev => ({ ...prev, ...JSON.parse(stringQuery) }));
  }, [stringQuery, setQueryMessages]);
  const resetList = () => {
    reloadMessages();
  };
  // When clicking the button will be saved to the bank
  const handleSubmit = async ({
    message,
    setFormErrors = () => { },
    resetForm = () => { formErrors() }
  } = {}) => {
    setLoading(prev => ({ ...prev, [message.id || "new"]: true }))
    setFormErrors({});
    let continueOperation = true;
    let newMessage = {
      ...query,
      ...formItem,
      userId: lodashGet(session, "userId")
    };
    if (
      !validateForm({
        formItem: newMessage,
        setFormErrors
      })
    ) {
      continueOperation = false;
    }
    if (!continueOperation) {
      setLoading(prev => ({ ...prev, [message.id || "new"]: false }));
      return;
    }
    await client.service("ticket_messages").create(newMessage);
    //resetList();
    resetForm();
    setLoading(prev => ({ ...prev, [message.id || "new"]: false }))
  }
  // Getting the state of the current input
  const handleChange = event => {
    setFormItem({
      text: event.target.value
    })
  }

  // Each time you update the message list the scroll function is activated
  useEffect(() => {
    if (listMessages.length > 0 && !loadingMessages) {
      scrollRef.current.scrollTo(0, 10000);
    }
  }, [listMessages, loadingMessages])

  return (
    <div>
      <AppBar position="static" className={classes.appbarRoot}  color="secondary">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" style={{textTransform: 'capitalize'}}>
            {ticket.id}: {ticket.title != undefined && ticket.title.toLowerCase()}
          </Typography>
        </Toolbar>
      </AppBar>
        <List ref={scrollRef} className={classes.root}>
            {listMessages.length !== 0 && !loadingMessages && lodashMap(listMessages.sort((a,b) => a.id - b.id), message => (
              <Message key={message.id} session={session} ticket={ticket} message={message} />
            ))}
        </List>
      <Input
        ticket={ticket}
        formItem={formItem}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        ticketClosed={ticketClosed}
        setFormErrors={setFormErrors}
        resetForm={resetForm}
        data={data}
      />
    </div>
  )

}

export default withRouter(withStyles(styles, { withTheme: true })(ChatSupport));