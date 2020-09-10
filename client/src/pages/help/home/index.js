import React from "react";

import { Grid } from '@material-ui/core'
import Logo from "../../landing/logo-dark.png";
import { withStyles, withRouter } from "../../../utils";
import { MasterDataForm, Button } from '../../../components';
import HomeModel from './model'

const styles = () => ({
  container: {
    textAlign: "center"
  },
  hrStyle: {
    width: "200px",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },
  buttonForm: {
    border: 'none',
    backgroundColor: '#f5b61d',
    padding: '10px 20px',
    fontSize: '18px',
    width: '250px',
    color: 'white',
    transition: '1s',
    '&:hover': {
      backgroundColor: '#e2a30a',
      transition: '1s'
    }
  }
})

const Home = ({ classes, reloadHome }) => {

  return (
    <Grid container className={classes.container}>
      <Grid item>
        <h1>Bem-vindo ao Wiki</h1>
        <img src={Logo} alt="" />
        <hr className={classes.hrStyle} />
        <h3>Contate-nos</h3>
        <MasterDataForm
          model={HomeModel.metadata}
          fields={HomeModel.contact}
          options={{
            dontSave: true,
            dontCreate: true,
            dontDelete: true,
            dontShowTree: true,
            dontRedirect: true,
          }}
          hooks={{
            afterDelete: reloadHome
          }}
          customContent={{
            afterForm: ({ handleSubmit }) =>
              <Button className={classes.buttonForm} text='Enviar' onClick={handleSubmit} />
          }}
        />
      </Grid>
    </Grid>
  )
}

export default withRouter(withStyles(styles, { withTheme: true })(Home));