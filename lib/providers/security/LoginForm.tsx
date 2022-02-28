import {
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Link,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { Person, Lock } from '@material-ui/icons'

import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
    fontSize: theme.typography.h3.fontSize,
  },
  card: {
    padding: theme.spacing(2),
    maxWidth: theme.spacing(60),
  },
  acciones: {
    textAlign: 'center',
    marginTop: theme.spacing(3),
  },
}))
const LoginForm = (): ReactElement => {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <div className={classes.root}>
      <Typography className={classes.titulo}>{t('Bienvenido a Rombo')}</Typography>
      <Card elevation={4} className={classes.card}>
        <CardContent>
          <form>
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  label={t('correo electrónico')}
                  fullWidth
                  placeholder={t('Ingresa tu correo electrónico')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('contraseña')}
                  fullWidth
                  type="password"
                  placeholder={t('Ingresa tu contraseña')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption">
                  {t('¿Olvidaste tu contraseña? ')}
                  <Link>{t('Recuperala aquí')}</Link>
                </Typography>
              </Grid>
              <Grid item xs={12} className={classes.acciones}>
                <Button fullWidth size="large" color="primary">
                  {t('Ingresar')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm
