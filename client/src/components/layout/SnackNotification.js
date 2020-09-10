import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '../../utils';
import {
  Card,
  CardActions,
  Typography,
  Icon,
  IconButton
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import moment from 'moment';

const styles = theme => ({
  card: {
    maxWidth: 450,
    minWidth: 344,
  },
  productionExceeded: {
    padding: '8px 8px 8px 16px',
    backgroundColor: '#adff2f',
  },
  stop: {
    padding: '8px 8px 8px 16px',
    backgroundColor: '#993399',
  },
  noise: {
    padding: '8px 8px 8px 16px',
    backgroundColor: '#ffa000',
  },
  icons: {
    marginLeft: 'auto',
  },
});

const SnackNotification = forwardRef((props, ref) => {

  const { closeSnackbar } = useSnackbar();

  // SET CSS
  let variant;

  if (props.notification.type === "production_exceeded") {
    variant = props.classes.productionExceeded
  }
  if (props.notification.type === "stop") {
    variant = props.classes.stop
  }
  if (props.notification.type === "noise") {
    variant = props.classes.noise
  }

  return (
    <Card className={props.classes.card} ref={ref}>
      <CardActions
        classes={{ root: `${variant}` }}
      >
        <div>
          <Typography variant='body2' gutterBottom>{props.notification.title}</Typography>
          <Typography
            variant='subtitle2'
            color='textSecondary'
            gutterBottom
          >
            {moment(props.notification.createdAt).format("ddd, DD [de] MMM [de] YYYY HH:mm")}
          </Typography>
        </div>
        <div className={props.classes.icons}>
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            className={props.classes.close}
            onClick={() => closeSnackbar(props.id)}
          >
            <Icon>close</Icon>
          </IconButton>
        </div>
      </CardActions>
    </Card>
  )
})

SnackNotification.propTypes = {
  id: PropTypes.number.isRequired,
};

export default withStyles(styles, { withTheme: true })(SnackNotification);
