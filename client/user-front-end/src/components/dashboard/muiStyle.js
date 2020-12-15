import makeStyles from "@material-ui/core/styles/makeStyles";
import { green } from '@material-ui/core/colors';

export default makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        flexGrow: 1,
        overflow: 'hidden',
    },
    paper: {
        width: '100%',
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.primary,
        fontWeight: '800',
        fontSize: '1.5rem',
        backgroundColor: '#19B5FE',
    },
    subheader: {
        zIndex: 10
    },
    box: {
        paddingTop: '0px !important',
        height: '100%',
        overflowY: 'auto',
    },
    list: {
        backgroundColor: '#D8D8D8',
        height: '100%',
        minHeight: '80vh',
    },
    itemUser: {
        zIndex: '1',
        marginTop: '5px',
        backgroundColor: 'inherit',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: '#C5C5C5',
        },
        '&:hover $iconOnline': {
            color: green[700]
        }
    },
    iconOnline: {
        color: green[500]
    }
}));
