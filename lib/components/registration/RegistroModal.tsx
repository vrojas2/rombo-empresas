import { CircularProgress, Dialog, DialogContent, Theme, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegistrationForm } from './RegistrationContext'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    opacity: 0.9,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(8),
    marginTop: theme.spacing(8),
  },
  progress: {
    marginBottom: theme.spacing(4),
  },
}))

const RegistroModal = (): ReactElement => {
  const { t } = useTranslation()
  const { isRegistering } = useRegistrationForm()
  const classes = useStyles()
  return (
    <Dialog open={isRegistering} fullWidth className={classes.root}>
      <DialogContent className={classes.content}>
        <CircularProgress className={classes.progress} thickness={6} size={80} color="primary" />
        <Typography color="primary" variant="h5">
          {t('Creando registro...')}
        </Typography>
      </DialogContent>
    </Dialog>
  )
}

export default RegistroModal
