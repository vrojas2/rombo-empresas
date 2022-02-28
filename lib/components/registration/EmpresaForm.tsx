import {
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography,
} from '@material-ui/core'
import { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TextField from '@material-ui/core/TextField'
import Business from '@material-ui/icons/BusinessCenter'
import { CatalogoItem, SearchResults } from '@rombomx/models'
import { request } from '../../services'
import { useErrorHandler } from '../../providers/errors'
import { EmpresaFormDTO } from './models'
import { RegistrationStates, useRegistrationForm } from './RegistrationContext'
import { Controller, useForm } from 'react-hook-form'

const otrosId = 9999999

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  titulo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  textoTitulo: {
    marginLeft: theme.spacing(2),
  },
  defaultSelect: {
    color: theme.palette.text.secondary,
  },
}))

const EmpresaForm = (): ReactElement => {
  const classes = useStyles()
  const { t } = useTranslation()
  const { handleError } = useErrorHandler()
  const [giros, setGiros] = useState<Array<CatalogoItem>>([])
  const [isOtros, setIsOtros] = useState<boolean>(false)

  const { currentStep, setCurrentStep, setEmpresa, doRegister } = useRegistrationForm()
  const {
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<EmpresaFormDTO>({
    defaultValues: {
      giroComercialId: -1,
      nombre: '',
      nombreGiroComercial: '',
    },
  })

  const searchGiros = async () => {
    try {
      const { items } = await request<SearchResults<CatalogoItem>>(
        'GET',
        'catalogos',
        `giros-comerciales`,
        true,
      )
      setGiros(items)
    } catch (e) {
      handleError(t('Error cargando giros de empresa'), e)
    }
  }

  const storeEmpresa = (values: EmpresaFormDTO) => {
    setEmpresa(values)
    setCurrentStep(RegistrationStates.PROCESSING_REGISTER)
  }

  const processEmpresa = async () => {
    await handleSubmit(storeEmpresa)()
    const isValid = await trigger()
    if (!isValid) setCurrentStep(RegistrationStates.VIEW_EMPRESA_FORM)
  }

  useEffect(() => {
    switch (currentStep) {
      case RegistrationStates.VALIDATE_EMPRESA_FORM:
        processEmpresa()
        break
      case RegistrationStates.PROCESSING_REGISTER:
        doRegister()
        break
    }
  }, [currentStep])

  useEffect(() => {
    searchGiros()
  }, [])

  return (
    <Card className={classes.root}>
      <CardContent>
        <div className={classes.titulo}>
          <Business />{' '}
          <Typography className={classes.textoTitulo}>{t('Datos de la empresa')}</Typography>
        </div>
        <form onSubmit={handleSubmit(storeEmpresa)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="nombre"
                control={control}
                rules={{
                  required: true,
                  minLength: 3,
                }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    fullWidth
                    label={t('Nombre de la empresa')}
                    error={!!errors.nombre}
                    helperText={errors.nombre && t('Se require un nombre de al menos 3 caracteres')}
                    onChange={onChange}
                    value={value}
                    inputProps={{ maxLength: 64 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                control={control}
                name="giroComercialId"
                rules={{
                  required: true,
                  min: 1,
                }}
                render={({ field: { onChange, value } }) => (
                  <FormControl fullWidth error={!!errors.giroComercialId}>
                    <InputLabel htmlFor="selector-giro">{t('Giro de empresa')}</InputLabel>
                    <Select
                      label={t('Giro de empresa')}
                      value={value}
                      onChange={(event) => {
                        onChange(event)
                        setIsOtros(event.target.value === otrosId)
                      }}
                      error={!!errors.giroComercialId}
                      className={value <= 0 ? classes.defaultSelect : undefined}
                    >
                      <MenuItem value={-1} disabled>
                        {t('Selecciona un giro para tu empresa')}
                      </MenuItem>
                      {giros.map(({ id, nombre }) => (
                        <MenuItem value={id} key={`giro-${id}`}>
                          {nombre}
                        </MenuItem>
                      ))}
                      <MenuItem value={otrosId}>{t('Otro giro comercial')}</MenuItem>
                    </Select>
                    <FormHelperText error>
                      {errors.giroComercialId && t('Selecciona un giro comercial')}
                    </FormHelperText>
                  </FormControl>
                )}
              />

              {isOtros && (
                <Controller
                  name="nombreGiroComercial"
                  control={control}
                  rules={{
                    required: true,
                    minLength: 3,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      fullWidth
                      label={t('Nombre del giro comercial')}
                      error={!!errors.nombreGiroComercial}
                      helperText={errors.nombreGiroComercial && t('Ingrese su giro comercial')}
                      onChange={onChange}
                      value={value}
                      inputProps={{ maxLength: 64 }}
                    />
                  )}
                />
              )}
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default EmpresaForm
