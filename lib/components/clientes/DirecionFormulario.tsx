import {
  Card,
  CardContent,
  Typography,
  Grid,
  makeStyles,
  InputAdornment,
  createStyles,
  Theme,
  Button,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'

import { IoTrashOutline } from 'react-icons/io5'
import { InputText } from '../commons/InputText'
import { Text } from '../commons/Text'
import { CheckBoxCustom } from '../commons/CheckBoxCustom'

export interface DireccionProps {
  control: any
  deshabilitado: boolean
  register?: any
  errors?: any
  key?: any
  index?: number
  borrar?: (index: number) => void
  onChangePrincipal?: any
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: '1em',
    },
    title: {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.hint,
    },
    delete: {
      textAlign: 'right',
      marginRight: 0,
      marginBottom: theme.spacing(2),
    },
    deleteIcon: {
      color: theme.palette.error.main,
      cursor: 'pointer',
    },
    deleteButton: {
      textAlign: 'right',
      paddingRight: 0,
    },
  }),
)
export const DireccionFormulario = ({
  errors,
  control,
  deshabilitado,
  index,
  borrar,
  onChangePrincipal,
}: DireccionProps): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <Card className={classes.root}>
      <CardContent>
        <Grid container direction="row" alignItems="center" justifyContent="space-between">
          <Grid item xs={10}>
            <Typography className={classes.title}>
              <Text
                text={
                  index === 0
                    ? 'Ingresa tus direcciones'
                    : `Ingresa los datos de la dirección ${index + 1}`
                }
              />
            </Typography>
          </Grid>
          <Grid xs={2}>
            {index !== 0 && !deshabilitado ? (
              <div className={classes.delete}>
                <IoTrashOutline
                  className={classes.deleteIcon}
                  size="1.5em"
                  onClick={() => borrar(index)}
                />
              </div>
            ) : null}
          </Grid>
        </Grid>

        <Grid container spacing={1}>
          {index !== 0 && (
            <Grid xs={12} item>
              <InputText
                errors={errors}
                control={control}
                name="nombre"
                index={index}
                fieldArrayName="direcciones"
                label="nombre completo"
                placeholder="ingresa el nombre de la direccioón"
                readOnly={deshabilitado}
                rules={{
                  required: {
                    value: false,
                  },
                  minLength: {
                    message: t('ingresa una nombre valido'),
                    value: 3,
                  },
                }}
                fullWidth
              />
            </Grid>
          )}
          <Grid xs={12} sm={9} item>
            <InputText
              errors={errors}
              control={control}
              name="direccion"
              index={index}
              fieldArrayName="direcciones"
              label="calle y numero"
              placeholder="ingresa la calle y numero"
              readOnly={deshabilitado}
              rules={{
                required: {
                  value: false,
                },
                minLength: {
                  message: t('ingresa una direccion valida'),
                  value: 3,
                },
              }}
              fullWidth
            />
          </Grid>
          <Grid xs={12} sm={3} item>
            <InputText
              errors={errors}
              control={control}
              name="codigoPostal"
              index={index}
              fieldArrayName="direcciones"
              label="C.P."
              placeholder="código postal"
              readOnly={deshabilitado}
              rules={{
                required: {
                  value: false,
                },
                pattern: {
                  value: /^[0-9]{5}$/,
                  message: t('codigo postal invalido'),
                },
              }}
              fullWidth
            />
          </Grid>
          <Grid xs={12} sm={6} item>
            <InputText
              errors={errors}
              control={control}
              index={index}
              name="municipio"
              fieldArrayName="direcciones"
              label="municipio"
              placeholder="municipio"
              readOnly={deshabilitado}
              rules={{
                required: {
                  value: false,
                },
                minLength: {
                  message: t('ingresa un municipio con al menos 3 caracteres'),
                  value: 3,
                },
              }}
              fullWidth
            />
          </Grid>
          <Grid xs={12} sm={6} item>
            <InputText
              errors={errors}
              control={control}
              name="ciudad"
              index={index}
              fieldArrayName="direcciones"
              label="ciudad"
              placeholder="ciudad"
              readOnly={deshabilitado}
              rules={{
                required: {
                  value: false,
                },
                minLength: {
                  message: t('ingresa un ciudad con al menos 3 caracteres'),
                  value: 3,
                },
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid xs={12} sm={6} item>
            <InputText
              errors={errors}
              control={control}
              name="estado"
              index={index}
              fieldArrayName="direcciones"
              label="estado"
              placeholder="estado"
              readOnly={deshabilitado}
              rules={{
                required: {
                  value: false,
                },
                minLength: {
                  message: t('ingresa un estado valido'),
                  value: 3,
                },
              }}
              fullWidth
            />
          </Grid>
          <Grid xs={12} sm={6} item>
            <InputText
              errors={errors}
              control={control}
              name="pais"
              index={index}
              fieldArrayName="direcciones"
              label="país"
              placeholder="país"
              readOnly={deshabilitado}
              rules={{
                required: {
                  value: false,
                },
                minLength: {
                  message: t('ingresa un país valido'),
                  value: 3,
                },
              }}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <Grid xs={12} sm={6} item>
            <CheckBoxCustom
              name="principal"
              index={index}
              fieldArrayName="direcciones"
              label="Marcar como dirección principal"
              control={control}
              disabled={deshabilitado}
              errors={errors}
              onChange={onChangePrincipal}
              rules={{
                required: {
                  value: false,
                },
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DireccionFormulario
