import {
  Button,
  Card,
  CardContent,
  Container,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { Alert } from '@material-ui/lab'

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  titulo: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.h4.fontSize,
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  instrucciones: {
    marginBottom: theme.spacing(2),
  },
}))

const RegistroTerminado = (): ReactElement => {
  const classes = useStyles()
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <Container>
      <Typography className={classes.titulo}>{t('¡Bienvenido a Rombo!')}</Typography>

      <Alert color="info">
        <Typography className={classes.instrucciones}>
          {t(
            'Hemos enviado un correo con un código de validación. ' +
              'Ingresa a la plataforma e ingresa este código para poder utilizar Rombo.',
          )}
        </Typography>
      </Alert>
      <br />
      <Button color="primary" onClick={() => router.push('/')}>
        {t('ingresa a rombo')}
      </Button>
    </Container>
  )
}

export default RegistroTerminado
