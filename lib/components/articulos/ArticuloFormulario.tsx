/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  makeStyles,
  createStyles,
  Theme,
  Button,
  Divider,
  TextField,
} from '@material-ui/core'
import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArticuloDeEmpresa, SatClaveProdServ, SatClaveUnidad } from '@rombomx/models/lib'
import { IoSearch } from 'react-icons/io5'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'
import { debug } from '../../services/logger'
import { isValidArray } from '@rombomx/ui-commons'
import { CheckBoxCustom, Text, InputText, DialogGeneric, AutocompleteField } from '../commons'
import { ArticuloRequest, ArticuloFormularioProps, ButtonsDialog } from '../../propTypes'
import ArticuloCaracteristicas from './ArticuloCaracteristicas'
import ImpuestosFormulario from './ImpuestosFormulario'
import VariantesFormulario from './VariantesFormulario'
import { deleteItem, getEntityRecord } from '../../services'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.primary,
    },
    card: {
      marginBottom: theme.spacing(2),
    },
    addDirection: {
      borderTop: '1px solid gray',
    },
    direction: {
      marginTop: '1em',
    },
    impuestoIcon: {
      cursor: 'pointer',
      color: theme.palette.primary.main,
    },
    errorText: {
      color: theme.palette.error.main,
      padding: '1em 2em',
    },
  }),
)

/**
 * Componente para mostrar el formulario de un articulo y sus variantes
 * @params ArticuloFormularioProps
 * @returns JSX.Element
 */
const ArticuloFormulario = ({
  id,
  articulo,
  deshabilitado = false,
  guardar,
  inputLabelProps,
  error,
  impuestos,
  clavesSat,
  clavesUnidades,
  setArticulo,
}: ArticuloFormularioProps): JSX.Element => {
  debug('articulo', articulo)
  const classes = useStyles()
  const router = useRouter()
  const { t } = useTranslation()
  const { handleError } = useErrorHandler()
  const { loading, successMessage } = useFeedback()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [claveSat, setClaveSat] = useState(null)
  const [claveUnidad, setClaveUnidad] = useState(null)
  const [resetForm, setResetForm] = useState<boolean>(false)
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    register,
    watch,
    formState: { errors },
  } = useForm<ArticuloRequest>({
    defaultValues: articulo,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  })

  const {
    fields: articuloCaracteristicasFields,
    remove: articuloCaracteristicasRemove,
    append: articuloCaracteristicasAppend,
  } = useFieldArray({
    control,
    name: 'articuloCaracteristicas',
  })

  const {
    fields: variantesFields,
    append: varianteAppend,
    remove: variantesRemove,
    replace: varianteReplace,
  } = useFieldArray({
    control,
    name: 'variantes',
  })

  const tieneVariantes = useWatch({
    control,
    name: 'tieneVariantes',
    defaultValue: false,
  })

  const variantes = useWatch({
    control,
    name: 'variantes',
  })

  const articuloCaracteristicas = watch(
    'articuloCaracteristicas',
    getValues()?.articuloCaracteristicas || [],
  )

  const loadClaveSat = () => {
    getEntityRecord<SatClaveProdServ>(
      'sat',
      `claves-productos-servicios/${articulo.satClaveProdServId}`,
    )
      .then((data) => {
        setClaveSat({
          id: data.id,
          name: `${data.clave}-${data.descripcion}`,
        })
      })
      .catch((e) => {
        console.error('error', e)
        setClaveSat(null)
      })
  }

  const loadClaveUnidad = () => {
    getEntityRecord<SatClaveUnidad>('sat', `unidad-de-medida/por-clave/${articulo.unidadMedida}`)
      .then((data) => {
        setClaveUnidad({
          id: data.clave,
          name: `${data.clave}-${data.nombre}`,
        })
      })
      .catch((e) => {
        console.error('error', e)
        setClaveUnidad(null)
      })
  }

  useEffect(() => {
    reset(articulo)
  }, [articulo, reset])

  useEffect(() => {
    if ((articulo && articulo.satClaveProdServId) || (articulo && articulo.unidadMedida)) {
      loadClaveSat()
      loadClaveUnidad()
    }
  }, [articulo])

  const limpiarFormulario = () => {
    reset({
      nombre: '',
      clave: '',
      unidadMedida: undefined,
      satClaveProdServId: undefined,
      precio: '',
      articuloCaracteristicas: [],
      variantes: [],
      impuestos: [],
    })
    setResetForm(true)
    setTimeout(() => {
      setResetForm(false)
    }, 300)
  }

  const eliminarVariantes = (value) => {
    reset({
      ...getValues(),
      articuloCaracteristicas: [],
      variantes: [],
      tieneVariantes: value,
    })

    return value
  }

  const eliminarArticulo = () => {
    loading(t('eliminando articulo').toString())
    deleteItem<ArticuloDeEmpresa>('articulos', `${id}`)
      .then(() => {
        setOpenModal(false)
        successMessage('articulo eliminado exitosamente')
        router.push('/articulos')
      })
      .catch((e) => {
        handleError(t('error al eliminar el articulo'), null, e)
      })
      .finally(() => loading(false))
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: () => setOpenModal(false),
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarArticulo,
      color: 'primary',
    },
  ]
  /**
   * Función para mostrar los botones de guardar, guardar y crear uno nuevo y salir.
   */
  const pintarBotonesDeAccion = () => {
    if (deshabilitado) return null

    return (
      <Grid item xs={12} sm={4}>
        <Grid container direction="column" spacing={1}>
          <Grid item xs={12}>
            <Button
              size="large"
              color="primary"
              fullWidth
              onClick={handleSubmit((data) => guardar(data))}
            >
              <Text text="guardar" />
            </Button>
          </Grid>
          {!id && (
            <Grid item xs={12}>
              <Button
                size="large"
                color="secondary"
                variant="outlined"
                fullWidth
                onClick={handleSubmit((data) => guardar(data, limpiarFormulario))}
              >
                <Text text="guardar y crear nuevo" />
              </Button>
            </Grid>
          )}
          {id && (
            <Grid item xs={12}>
              <Button
                size="large"
                color="secondary"
                variant="outlined"
                fullWidth
                onClick={() => setOpenModal(true)}
              >
                <Text text="eliminar" />
              </Button>
            </Grid>
          )}
          <Grid item xs={12}>
            <Link href="/articulos">
              <Button size="large" color="default" fullWidth>
                <Text text="salir" />
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  const mapper = (results) => {
    if (results && isValidArray(results.items)) {
      return results.items.map((item) => ({
        id: item.id,
        name: `${item.clave}-${item.descripcion}`,
        data: item,
      }))
    }
    return []
  }

  const mapperUdM = (results) => {
    if (results && isValidArray(results.items)) {
      return results.items.map((item) => ({
        id: item.id,
        name: `${item.clave}-${item.nombre}`,
        clave: item.clave,
        data: item,
      }))
    }
    return []
  }

  const changeClaveSat = (value) => {
    setValue('satClaveProdServId', value.id)
  }

  const changeClaveUnidad = (value) => {
    setValue('unidadMedida', value.clave.toString())
  }

  const muestraError = () => {
    if (!error) {
      return null
    }
    return (
      <div className={classes.errorText}>
        <Text text={error.error} />
      </div>
    )
  }

  return (
    <form>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={deshabilitado ? 12 : 8}>
          <Card className={classes.card}>
            <CardContent>
              {!deshabilitado && (
                <Typography className={classes.title}>
                  <Text text="@rombomx/ui-commonsos del nuevo articulo" />
                </Typography>
              )}
              <Grid container spacing={1}>
                <Grid xs={12} item>
                  <InputText
                    errors={errors}
                    control={control}
                    register={register}
                    name="nombre"
                    label="nombre completo"
                    placeholder="ingresa el nombre completo del articulo"
                    rules={{
                      required: {
                        message: t('el nombre es requerido'),
                        value: true,
                      },
                      minLength: {
                        message: t('ingresa un nombre con al menos 3 caracteres'),
                        value: 3,
                      },
                    }}
                    fullWidth
                    required
                    inputLabelProps={inputLabelProps}
                    readOnly={deshabilitado}
                  />
                </Grid>
                <Grid xs={6} item>
                  {deshabilitado ? (
                    <TextField
                      label={t('Clave SAT')}
                      inputProps={{ readOnly: deshabilitado }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={claveSat?.name}
                      fullWidth
                    />
                  ) : (
                    <AutocompleteField
                      name="satClaveProdServId"
                      label="Clave SAT"
                      src="sat"
                      path="claves-productos-servicios"
                      errors={errors}
                      control={control}
                      inputProps={{
                        endAdornment: deshabilitado ? null : <IoSearch />,
                      }}
                      srcMapper={mapper}
                      onChangeInput={(value) => {
                        console.log('value clavesat', value)
                      }}
                      options={clavesSat}
                      onChange={changeClaveSat}
                      defaultValue={claveSat}
                      reset={resetForm}
                      fullWidth
                      freeSolo
                    />
                  )}
                </Grid>
                <Grid xs={6} item>
                  {deshabilitado ? (
                    <TextField
                      label={t('Unidad de medida')}
                      inputProps={{ readOnly: deshabilitado }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={claveUnidad?.name}
                      fullWidth
                    />
                  ) : (
                    <AutocompleteField
                      name="unidadMedida"
                      label="Unidad de medida"
                      src="sat"
                      path="unidad-de-medida"
                      errors={errors}
                      control={control}
                      inputProps={{
                        endAdornment: deshabilitado ? null : <IoSearch />,
                      }}
                      srcMapper={mapperUdM}
                      options={clavesUnidades}
                      onChange={changeClaveUnidad}
                      defaultValue={claveUnidad}
                      reset={resetForm}
                      fullWidth
                      freeSolo
                    />
                  )}
                </Grid>
              </Grid>
              <Grid xs={12} sm={6} item>
                <CheckBoxCustom
                  name="tieneVariantes"
                  label="Este artículo tiene variantes"
                  control={control}
                  disabled={deshabilitado}
                  errors={errors}
                  onChange={(e) => eliminarVariantes(e)}
                  rules={{
                    required: {
                      value: false,
                    },
                  }}
                />
              </Grid>
              <Grid container spacing={1}>
                <Grid sm={6} item>
                  <InputText
                    register={register}
                    errors={errors}
                    control={control}
                    name="clave"
                    label="clave del artículo"
                    placeholder="ingresa la clave del artículo"
                    disabled={tieneVariantes}
                    rules={{
                      required: false,
                    }}
                    fullWidth
                    readOnly={deshabilitado}
                  />
                </Grid>
                <Grid sm={6} item>
                  <InputText
                    register={register}
                    errors={errors}
                    control={control}
                    name="precio"
                    label="precio del artículo"
                    placeholder="ingresa el precio del artículo"
                    disabled={tieneVariantes}
                    rules={{
                      required: false,
                    }}
                    fullWidth
                    readOnly={deshabilitado}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <ImpuestosFormulario
            articuloId={id}
            impuestos={impuestos}
            deshabilitado={deshabilitado}
            setValue={setValue}
            impuestosDefault={articulo?.impuestos}
          />

          {tieneVariantes && (
            <Card className={classes.card}>
              <ArticuloCaracteristicas
                control={control}
                append={articuloCaracteristicasAppend}
                fields={articuloCaracteristicasFields}
                errors={errors}
                setValue={setValue}
                getValues={getValues}
                deshabilitado={deshabilitado}
                articuloId={id}
                setArticulo={setArticulo}
                variantes={variantes}
                remove={articuloCaracteristicasRemove}
              />
              <Divider />
              {muestraError()}
              {articuloCaracteristicas && articuloCaracteristicas.length > 0 && (
                <VariantesFormulario
                  control={control}
                  remove={variantesRemove}
                  append={varianteAppend}
                  fields={variantesFields}
                  errors={errors}
                  deshabilitado={deshabilitado}
                  articuloCaracteristicas={articuloCaracteristicas}
                  articuloId={id}
                  replace={varianteReplace}
                  variantesDefault={articulo?.variantes}
                />
              )}
            </Card>
          )}
        </Grid>
        {pintarBotonesDeAccion()}
      </Grid>
      {openModal && (
        <DialogGeneric
          open={openModal}
          text="¿Deseas eliminar de forma permanente el articulo selecionado?"
          title="Eliminar artículo"
          buttons={botonesBorrar}
          handleClose={() => setOpenModal(false)}
          actions
        />
      )}
    </form>
  )
}

export default ArticuloFormulario
