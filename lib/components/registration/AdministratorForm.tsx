import {
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  makeStyles,
  OutlinedInput,
  TextField,
  Theme,
  Typography,
} from '@material-ui/core'
import { createContext, ReactElement, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Person from '@material-ui/icons/Person'
import InputMask from 'react-input-mask'
import { Controller, useForm } from 'react-hook-form'
import { AdministradorFormDTO } from './models'
import { RegistrationStates, useRegistrationForm } from './RegistrationContext'
import { InputText } from '../commons'

export type AdminFormContextProps = {
  submit: () => void
  values: AdministradorFormDTO
}

export const AdminFormContext = createContext<AdminFormContextProps>(null)

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  titulo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  textoTitulo: {
    marginLeft: theme.spacing(2),
  },
}))

const AdministrationForm = (): ReactElement => {
  const classes = useStyles()
  const { t } = useTranslation()
  const [visibility, setVisibility] = useState<boolean>(false)
  const { currentStep, setCurrentStep, setAdmin } = useRegistrationForm()

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    trigger,
  } = useForm<AdministradorFormDTO & { contrasenaCheck: string }>({
    defaultValues: {
      nombre: '',
      contrasena: '',
      correo: '',
      numeroTelefonico: '',
      contrasenaCheck: '',
    },
  })

  const contrasena = useRef({})
  contrasena.current = watch('contrasena', '')

  const storeAdministrador = (values: AdministradorFormDTO) => {
    setAdmin(values)
  }

  const validate = async () => {
    try {
      await handleSubmit((values) => {
        setAdmin(values)
        setCurrentStep(RegistrationStates.VIEW_EMPRESA_FORM)
      })()
      const isValid = await trigger()
      if (!isValid) setCurrentStep(RegistrationStates.VIEW_ADMIN_FORM)
    } catch (e) {
      console.error('Error validando', e)
    }
  }

  useEffect(() => {
    if (currentStep === RegistrationStates.VALIDATE_ADMIN_FORM) validate()
  }, [currentStep])

  return (
    <AdminFormContext.Provider
      value={{
        submit: () => {
          console.log('Submitting')
        },
        values: {
          contrasena: '',
          correo: '',
          nombre: '',
          numeroTelefonico: '',
        },
      }}
    >
      <Container>
        <Card className={classes.root}>
          <CardContent>
            <div className={classes.titulo}>
              <Person />{' '}
              <Typography className={classes.textoTitulo}>
                {t('Datos del administrador')}
              </Typography>
            </div>
            <form onSubmit={handleSubmit(storeAdministrador)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="nombre"
                    control={control}
                    rules={{
                      minLength: 3,
                      required: true,
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        error={!!errors.nombre}
                        helperText={errors.nombre && t('ingrese un nombre de más de 3 caracteres')}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label={t('Nombre completo')}
                        tabIndex={10}
                        inputProps={{ maxLength: 64 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Controller
                    name="correo"
                    control={control}
                    rules={{
                      pattern: /\S+@\S+\.\S+/,
                      required: true,
                    }}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        error={!!errors.correo}
                        helperText={errors.correo && t('ingrese un correo electrónico válido')}
                        onChange={onChange}
                        value={value}
                        fullWidth
                        label={t('Correo electrónico')}
                        tabIndex={11}
                        inputProps={{ maxLength: 64 }}
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Controller
                    name="numeroTelefonico"
                    control={control}
                    rules={{
                      required: true,
                      pattern: /\(\+\d\d*\)\s\d{2}\s\d{4}\s\d{4}/g,
                    }}
                    render={({ field: { onChange, value } }) => (
                      <InputMask mask="(+52) 99 9999 9999" value={value} onChange={onChange}>
                        {() => (
                          <TextField
                            fullWidth
                            error={!!errors.numeroTelefonico}
                            helperText={
                              errors.numeroTelefonico &&
                              t('Ingrese un número teléfonico válido (+52) 9999 9999')
                            }
                            label={t('Número de teléfono')}
                            tabIndex={12}
                          />
                        )}
                      </InputMask>
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Controller
                    name="contrasena"
                    control={control}
                    rules={{
                      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                      required: true,
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl fullWidth>
                        <InputLabel error={!!errors.contrasena} htmlFor="contrasena-adornment">
                          {t('Contraseña')}
                        </InputLabel>
                        <OutlinedInput
                          id="contrasena-adornment"
                          error={!!errors.contrasena}
                          label={t('Contraseña')}
                          type={visibility ? 'text' : 'password'}
                          onChange={onChange}
                          value={value}
                          tabIndex={13}
                          inputProps={{ maxLength: 64 }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setVisibility((prev) => !prev)}
                                edge="end"
                                tabIndex={18}
                              >
                                {visibility ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                        <FormHelperText error>
                          {errors.contrasena &&
                            t(
                              'La contraseña debe de contener mayúsculas, minúsculas, números, caracteres especiales y al menos 8 caracteres',
                            )}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Controller
                    name="contrasenaCheck"
                    control={control}
                    rules={{
                      validate: (value) => {
                        return (
                          (value && value.trim() !== '' && value === contrasena.current) ||
                          t('La contraseña es incorrecta').toString()
                        )
                      },
                    }}
                    render={({ field: { onChange, value } }) => (
                      <FormControl fullWidth>
                        <InputLabel
                          error={!!errors.contrasenaCheck}
                          htmlFor="confirma-contrasena-adornment"
                        >
                          {t('Confirma la contraseña')}
                        </InputLabel>
                        <OutlinedInput
                          id="confirma-contrasena-adornment"
                          label={t('Confirma la contraseña')}
                          error={!!errors.contrasenaCheck}
                          type={visibility ? 'text' : 'password'}
                          onChange={onChange}
                          value={value}
                          tabIndex={14}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                tabIndex={19}
                                aria-label="toggle password visibility"
                                onClick={() => setVisibility((prev) => !prev)}
                              >
                                {visibility ? <Visibility /> : <VisibilityOff />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                        <FormHelperText error>{errors.contrasenaCheck?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </AdminFormContext.Provider>
  )
}

export default AdministrationForm
