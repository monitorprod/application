import React from 'react';
import {
  withStyles,
  lodashGet,
  lodashIsNil
} from '../../../utils';
import { Typography, Avatar, ListItem, ListItemText, ListItemAvatar, Icon } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person'
import moment from 'moment';
import classnames from 'classnames';


const styles = theme => ({
  date: {
    fontSize: "0.8em",
    color: "grey"
  },
  response: {
    textAlign: "end"
    // maxWidth: 300
  },
  colored: {
    backgroundColor: "rgba(0, 0, 0, .14)",
    padding: 15,
    borderRadius: "6px"
  },
  listTextWrap: {
    wordWrap: 'break-word'
  },
  viewed: {
    fontSize: "14px",
    marginBottom: "-2px",
    marginLeft: "5px"
  }
})

const Messages = ({ classes, session, message }) => {

  const userId = lodashGet(session, "userId");
  const tab = <span style={{ minWidth: "33%" }} />;
  const user = lodashGet(message, "user.name");

  return (
    <React.Fragment>
      {/* <Separator date={message.createdAt} /> */}
      {userId !== message.userId && (
        <ListItem>
          <ListItemAvatar>
            <Avatar
              style={{
                backgroundColor: "#424242",
                height: 40,
                width: 40,
                padding: 4
              }}
              alt="Admin MP"
              src={message.user.companyId === null ? "https://www.monitorprod.com.br/static/media/logo.10c8593f.svg" : null}
            >
              {message.user.companyId === null ? null : <PersonIcon color='secondary' />}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            className={classes.listTextWrap}
            primary={
              <Typography component="span" variant="body2" color="textPrimary">
                {message.text}
              </Typography>
            }
            secondary={
              <Typography className={classes.date}>
                {`${user} - ${moment(message.createdAt).format("DD/MM/YYYY HH:mm")}`}<Icon className={classes.viewed}>{lodashIsNil(message, "viewedAt") ? "done" : "done_all" }</Icon>
              </Typography>
            }
          />
          {tab}
        </ListItem>
      )}
      {userId === message.userId && (
        <ListItem className={classes.response}>
          {tab}
          <ListItemText
            className={classnames(classes.colored, classes.listTextWrap)}
            primary={
              <Typography component="span" variant="body2" color="textPrimary">
                {message.text}
              </Typography>
            }
            secondary={
              <Typography className={classes.date}>
                {`${user} - ${moment(message.createdAt).format("DD/MM/YYYY HH:mm")}`}<Icon className={classes.viewed}>{message.viewedAt === null ? "done" : "done_all" }</Icon>
              </Typography>
            }
          />
        </ListItem>
      )}
    </React.Fragment>
  )

}

export default withStyles(styles, { withTheme: true })(Messages);