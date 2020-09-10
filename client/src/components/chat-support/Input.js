import React, { useContext, useState , useEffect} from "react";
import { AppBar, Toolbar, InputBase, Divider, IconButton, Icon,TextField } from "@material-ui/core";
import {withStyles} from '../../utils';
import dbx from './dropbox';

const styles = theme => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center"
  },
  input: {
    color: theme.palette.common.white,
    //backgroundColor: "#ffffff78",
    borderRadius: "6px",
    marginLeft: theme.spacing(1),
    padding: "4px 10px",
    flex: 1
  },
  appBar: {
    top: "auto",
    bottom: 0,
    backgroundColor: "#424242",
    zIndex: "auto"
  },
  iconButton: {
    padding: 10
  },
  divider: {
    backgroundColor: '#ffffff1f',
    height: 28,
    margin: 4
  }
});

const Input = ({ formItem, handleChange, handleSubmit, ticketClosed, setFormErrors, resetForm, data, classes ,ticket}) => {
  const [file, setFile] = useState();
  const [uploadResponse, setUploadResponse] = useState('cloud_upload');
  const UPLOAD_FILE_SIZE_LIMIT = 150 * 1024 * 1024;

  const saveFile = evt => {
    setFile(evt.target.files[0]);
  }

  useEffect(() => {
    if (file !== undefined){
      setUploadResponse('loop');
      if (file.size < UPLOAD_FILE_SIZE_LIMIT) { // File is smaller than 150 Mb - use filesUpload API
        dbx.filesUpload({path: '/support/' + ticket.id + '/' + file.name, contents: file})
          .then(function(response) {
            setUploadResponse('done');
          })
          .catch(function(error) {
            setUploadResponse('error');
          });
      } else { // File is bigger than 150 Mb - use filesUploadSession* API
        const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size

        var workItems = [];     
      
        var offset = 0;

        while (offset < file.size) {
          var chunkSize = Math.min(maxBlob, file.size - offset);
          workItems.push(file.slice(offset, offset + chunkSize));
          offset += chunkSize;
        } 
          
        const task = workItems.reduce((acc, blob, idx, items) => {
          if (idx === 0) {
            // Starting multipart upload of file
            return acc.then(function() {
              return dbx.filesUploadSessionStart({ close: false, contents: blob})
                        .then(response => response.session_id)
            });          
          } else if (idx < items.length-1) {  
            // Append part to the upload session
            return acc.then(function(sessionId) {
            var cursor = { session_id: sessionId, offset: idx * maxBlob };
            return dbx.filesUploadSessionAppendV2({ cursor: cursor, close: false, contents: blob }).then(() => sessionId); 
            });
          } else {
            // Last chunk of data, close session
            return acc.then(function(sessionId) {
              var cursor = { session_id: sessionId, offset: file.size - blob.size };
              var commit = { path: '/' + file.name, mode: 'add', autorename: true, mute: false };              
              return dbx.filesUploadSessionFinish({ cursor: cursor, commit: commit, contents: blob });           
            });
          }          
        }, Promise.resolve());
        
        task.then(function(result) {
          var results = document.getElementById('results');
          results.appendChild(document.createTextNode('File uploaded!'));
        }).catch(function(error) {
          console.error(error);
        });
      }
    }
  },[file])

  return (
    <AppBar position="static" className={classes.appBar}>
      <Toolbar>
      <input
          id="files"
          name="files"
          type="file"
          size="1"
          onChange={saveFile}
          style={{ display: 'none' }}
        ></input>        
        <IconButton className={classes.iconButton} aria-label="menu"  onClick={() => document.getElementById("files").click()}>
          <Icon style={{ color: "white" }}>attach_file</Icon>
        </IconButton>
          <Icon>{uploadResponse}</Icon>
        <InputBase
          className={classes.input}
          placeholder="Nova Mensagem"
          inputProps={{ "aria-label": "Nova Mensagem" }}
          value={formItem.text}
          readOnly={data.ticketStatusId === ticketClosed ? true : false}
          onChange={handleChange}
          onKeyPress={event => {
            if (event.which === 13) {
              handleSubmit({ message: formItem, setFormErrors, resetForm });
            }
          }}
        />
        <Divider className={classes.divider} orientation="vertical" />
        <IconButton
          style={{ color: "#ffb300" }}
          className={classes.iconButton}
          aria-label="Enviar"
          onClick={() => handleSubmit({ message: formItem, setFormErrors, resetForm })}
        >
          <Icon>send</Icon>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default withStyles(styles, { withTheme: true })(Input);