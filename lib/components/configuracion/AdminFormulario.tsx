import { Grid, Card, CardContent, TextField, Typography, Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2),
    textAlign: 'left',
    fontSize: theme.typography.h6.fontSize,
  },
}))

export const Administrador = (): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid item xs={12}>
              <Typography className={classes.title}>{t('Administrador')}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={'Nombre del administrador'}
                inputProps={{ readOnly: true }}
                InputLabelProps={{
                  shrink: true,
                }}
                value=""
                fullWidth
                className="grid-99"
              />
            </Grid>
            <Grid container direction="row" alignItems="center">
              <Grid item xs={6}>
                <TextField
                  label={'Número de teléfono'}
                  inputProps={{ readOnly: true }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value=""
                  fullWidth
                  className="grid-90"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label={'Correo electrónico'}
                  inputProps={{ readOnly: true }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value=""
                  fullWidth
                  className="grid-90"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Administrador
