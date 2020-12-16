import React, { useState, useEffect } from "react";
import {
  withStyles,
  makeStyles,
  ThemeProvider,
  createMuiTheme,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import SocketManager from "../../socketio/SocketManager";
import { useHistory } from "react-router-dom";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#8e24aa",
    },
  },
});

const useStyles = makeStyles((theme) => ({
  form: {
    width: "500px",
    margin: "auto",
    padding: "2em",
    backgroundColor: "#ffffff",
    marginBottom: "40px",
    borderRadius: "0.125rem",
    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
  },
  loginButton: {
    padding: "10px",
    marginTop: "20px",
    backgroundColor: "#2cbc63",
    "&:hover": {
      backgroundColor: "#22934d",
    },
  },
}));
const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

export default function AddBoardModal({ handleToggleModal, onAddBoard }) {
  const classes = useStyles();
  const [form, setForm] = useState({
    name: "",
    content: "",
  });
  const { name, content } = form;
  const socket = SocketManager.getSocket();
  let history = useHistory();

  const handleChange = (text) => (e) => {
    setForm({ ...form, [text]: e.target.value });
  };

  const handleClose = () => {
    handleToggleModal();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const onClickCreate = () => {
    socket.emit("create-room");
  };

  useEffect(() => {
    socket.on("create-room-successful", (id) => {
      history.push(`/game/${id}`);
    });
  }, []);

  return (
    <div>
      <Dialog
        onClose={handleToggleModal}
        aria-labelledby="customized-dialog-title"
        open={true}
      >
        <DialogTitle
          id="customized-dialog-title"
          onClose={handleToggleModal}
          style={{ display: "flex", justifyContent: "center" }}
        >
          Create Game
        </DialogTitle>
        <DialogContent dividers>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <ThemeProvider theme={theme}>
              {/* <TextField
                                autoFocus
                                required
                                margin="normal"
                                fullWidth
                                id="name"
                                label="Name"
                                name={name}
                                value={name}
                                onChange={handleChange('name')} />
                            <TextField
                                required
                                margin="normal"
                                fullWidth
                                id="content"
                                label="Content Context"
                                name={content}
                                value={content}
                                onChange={handleChange('content')} /> */}
            </ThemeProvider>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.loginButton}
              onClick={onClickCreate}
            >
              Create
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
