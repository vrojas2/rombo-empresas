import {
  Backdrop,
  CircularProgress,
  makeStyles,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  Grid,
  Snackbar,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { IoAlertCircleOutline } from 'react-icons/io5'
import { createContext, PropsWithChildren, useContext, useState } from 'react'

const ICON_SIZE = '1em'

export type FeedbackContextProps = {
  loading: (message?: string | boolean, val?: boolean) => void
  isLoading: () => boolean
  errorMessage: (message: string, title?: string) => void
  successMessage: (message: string) => void
  attentionMessage: (message: string) => void
}

export const FeedbackContext = createContext<FeedbackContextProps>(null)

export const useFeedback = (): FeedbackContextProps => useContext(FeedbackContext)

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 9999,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  typography: {
    marginTop: theme.spacing(2),
  },
  errorDialog: {
    '&.icon': {
      color: theme.palette.error.main,
    },
  },
  errorDialogIcon: {
    color: theme.palette.error.main,
    ...theme.typography.h4,
    marginBottom: theme.spacing(2),
  },
  errorDialogTitle: {
    paddingLeft: theme.spacing(1),
    ...theme.typography.h5,
  },
  errorDialogText: {},
  errorDialogButton: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.getContrastText(theme.palette.error.main),
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.getContrastText(theme.palette.error.dark),
    },
  },
  attentionDialog: {},
  attentionDialogIcon: {
    color: theme.palette.warning.main,
    ...theme.typography.h4,
    marginBottom: theme.spacing(2),
  },
  attentionDialogButton: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.getContrastText(theme.palette.warning.main),
    '&:hover': {
      backgroundColor: theme.palette.warning.dark,
      color: theme.palette.getContrastText(theme.palette.warning.dark),
    },
  },
}))

export const FeedbackProvider = ({ children }: PropsWithChildren<any>): JSX.Element => {
  const [isLoading, setIsLoading] = useState<{ value: boolean; message: string }>({
    message: 'cargando',
    value: false,
  })

  const [errorDialog, setErrorDialog] = useState<{
    value: boolean
    message: string
    title?: string
  }>({
    message: 'ha ocurrido un error',
    value: false,
  })

  const [successDialog, setSuccessDialog] = useState<{ value: boolean; message: string }>({
    value: false,
    message: '',
  })

  const [attentionDialog, setAttentionDialog] = useState<{ value: boolean; message: string }>({
    value: false,
    message: '',
  })
  const classes = useStyles()

  const handleErrorDialogClose = () => {
    setErrorDialog({
      value: false,
      message: errorDialog.message,
    })
  }

  const handleAttentionDialogClose = () => {
    setAttentionDialog({
      value: false,
      message: attentionDialog.message,
    })
  }

  const handleSuccessDialogClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setSuccessDialog({
      message: '',
      value: false,
    })
  }

  return (
    <FeedbackContext.Provider
      value={{
        isLoading: () => isLoading.value,
        loading(message, val = true) {
          setIsLoading(
            typeof message === 'boolean'
              ? {
                  value: message,
                  message: 'cargando...',
                }
              : {
                  value: val,
                  message,
                },
          )
        },
        errorMessage(message, title) {
          setErrorDialog({
            title,
            value: true,
            message,
          })
        },
        successMessage(message) {
          setSuccessDialog({
            message,
            value: true,
          })
        },
        attentionMessage(message) {
          setAttentionDialog({
            message,
            value: true,
          })
        },
      }}
    >
      <Backdrop className={classes.backdrop} open={isLoading.value}>
        <CircularProgress color="inherit" />
        <Typography className={classes.typography}>{isLoading.message}...</Typography>
      </Backdrop>
      <Dialog
        open={errorDialog.value}
        aria-labelledby="alert-dialog-message"
        aria-describedby="alert-dialog-description"
        className={classes.errorDialog}
        fullWidth
        maxWidth="sm"
        onClose={handleErrorDialogClose}
      >
        <DialogContent dividers id="alert-dialog-description">
          <Grid container>
            <Grid item>
              <IoAlertCircleOutline className={classes.errorDialogIcon} size={ICON_SIZE} />
            </Grid>
            <Grid item>
              <Typography className={classes.errorDialogTitle}>
                {errorDialog.title || 'Atención'}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item>
              <Typography id="alert-dialog-message" className={classes.errorDialogText}>
                {errorDialog.message}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button className={classes.errorDialogButton} autoFocus onClick={handleErrorDialogClose}>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={attentionDialog.value}
        aria-labelledby="attention-dialog-message"
        aria-describedby="attention-dialog-description"
        className={classes.attentionDialog}
        fullWidth
        maxWidth="xs"
        onClose={handleAttentionDialogClose}
      >
        <DialogContent dividers id="attention-dialog-description">
          <Grid container>
            <Grid item>
              <IoAlertCircleOutline className={classes.attentionDialogIcon} size={ICON_SIZE} />
            </Grid>
            <Grid item>
              <Typography className={classes.errorDialogTitle}>{'Atención'}</Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item>
              <Typography id="alert-dialog-message" className={classes.errorDialogText}>
                {attentionDialog.message}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            className={classes.attentionDialogButton}
            autoFocus
            onClick={handleAttentionDialogClose}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={successDialog.value}
        onClose={handleSuccessDialogClose}
        autoHideDuration={6000}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
      >
        <Alert elevation={6} variant="filled" severity="success" onClose={handleSuccessDialogClose}>
          {successDialog.message}
        </Alert>
      </Snackbar>
      {children}
    </FeedbackContext.Provider>
  )
}
