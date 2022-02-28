import {
  Grid,
  Card,
  CardContent,
  TextField,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginBottom: theme.spacing(2),
    textAlign: 'left',
    fontSize: theme.typography.h6.fontSize,
  },
}))

export const Empresa = (): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid item xs={12}>
              <Typography className={classes.title}>{t('Empresa')}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={'Nombre de la empresa'}
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
                  label={'Giro'}
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
                  label={'RFC'}
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
            <Grid container direction="row" alignItems="center">
              <Grid item xs={6}>
                <TextField
                  label={'Teléfono de contacto'}
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
            <Grid container direction="row" alignItems="center">
              <Grid item xs={6}>
                <TextField
                  label={'Nombre de la calle'}
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
                  label={'Código Postal'}
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
            <Grid container direction="row" alignItems="center">
              <Grid item xs={6}>
                <TextField
                  label={'Municipio'}
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
                  label={'Ciudad'}
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
            <Grid container direction="row" alignItems="center">
              <Grid item xs={6}>
                <TextField
                  label={'Estado'}
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
                  label={'País'}
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

export default Empresa
