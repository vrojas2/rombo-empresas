import { useEffect, useState } from 'react'
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
import { useForm, useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { IoInformationCircleOutline, IoAddCircleOutline } from 'react-icons/io5'
import getConfig from 'next/config'
import { ClienteDeEmpresa } from '@rombomx/models/lib'

import { emailValidation } from '../../constants'
import { InputText } from '../commons/InputText'
import { Text } from '../commons/Text'
import { DireccionFormulario, isEmptyString } from './'
import { useFeedback } from '../../providers/feedback'
import { ClienteRequest, ButtonsDialog } from '../../propTypes'
import { DialogGeneric } from '../commons'
import { useErrorHandler } from '../../providers/errors'
import { deleteItem } from '../../services'

const { publicRuntimeConfig } = getConfig()
const { maxDirections } = publicRuntimeConfig
interface ClienteFormularioProps {
  id?: number
  deshabilitado?: boolean
  cliente?: ClienteRequest
  guardar?: (vals: ClienteRequest, callback?: () => void) => void
  inputLabelProps?: any
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.hint,
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
    directionIcon: {
      color: theme.palette.primary.main,
    },
  }),
)

const ClienteFormulario = ({
  id,
  cliente,
  deshabilitado = false,
  guardar,
  inputLabelProps,
}: ClienteFormularioProps): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()
  const router = useRouter()
  const { errorMessage, successMessage, loading } = useFeedback()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const { handleError } = useErrorHandler()

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ClienteRequest>({
    defaultValues: cliente,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'direcciones',
  })

  useEffect(() => {
    reset(cliente)
    if (
      (!id && !deshabilitado) ||
      (id && Array.isArray(getValues().direcciones) && getValues().direcciones.length === 0)
    ) {
      append({ principal: true })
    }
  }, [cliente, reset])

  function limpiarFormulario() {
    reset({
      nombre: '',
      telefono: '',
      rfc: '',
      correo: '',
      referencia: '',
      direcciones: [
        {
          nombre: '',
          direccion: '',
          codigoPostal: '',
          municipio: '',
          ciudad: '',
          estado: '',
          pais: '',
          principal: true,
        },
      ],
    })
  }

  const eliminarCliente = () => {
    loading(t('eliminando cliente').toString())
    deleteItem<ClienteDeEmpresa>('clientes', `${id}`)
      .then((res) => {
        setOpenModal(false)
        successMessage('Cliente eliminado exitosamente')
        router.push('/clientes')
      })
      .catch((e) => {
        handleError(t('error al eliminar el cliente'), null, e)
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
      onClick: eliminarCliente,
      color: 'primary',
    },
  ]

  function agregarNuevaDireccion() {
    if (fields.length < Number(maxDirections)) {
      return append({
        nombre: '',
        direccion: '',
        codigoPostal: '',
        municipio: '',
        ciudad: '',
        estado: '',
        pais: '',
      })
    }
    return errorMessage(`Solo se permite agregar un máximo de ${maxDirections} direcciones`)
  }

  function eliminarDireccion(index: number) {
    if (fields.length > 0) {
      const values = getValues()
      if (
        Array.isArray(values.direcciones) &&
        values.direcciones.length > 0 &&
        values.direcciones[index].principal
      ) {
        setValue(`direcciones.0.principal`, true)
      }
      return remove(index)
    }
  }

  function onChangePrincipal(value, index) {
    const values = getValues()

    if (Array.isArray(values.direcciones) && values.direcciones.length > 0) {
      values.direcciones.forEach((direccion, i) => {
        if (i !== index) {
          setValue(`direcciones.${i}.principal`, false)
        }
      })
    }

    return value
  }

  function mostrarDirecciones() {
    if (!Array.isArray(fields) || fields.length === 0) {
      return null
    }

    return fields.map((item, index) => {
      if (
        deshabilitado &&
        isEmptyString(item.direccion) &&
        isEmptyString(item.codigoPostal) &&
        isEmptyString(item.municipio) &&
        isEmptyString(item.estado) &&
        isEmptyString(item.pais)
      ) {
        return null
      }

      return (
        <DireccionFormulario
          key={item.id}
          control={control}
          deshabilitado={deshabilitado}
          errors={errors}
          index={index}
          borrar={eliminarDireccion}
          onChangePrincipal={onChangePrincipal}
        />
      )
    })
  }

  function pintarBotonesDeAccion() {
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
                <Text text="Eliminar" />
              </Button>
            </Grid>
          )}
          <Grid item xs={12}>
            <Link href="/clientes">
              <Button size="large" color="default" fullWidth>
                <Text text="salir" />
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  function pintarBotonAgregarDireccion() {
    if (deshabilitado) return null
    return (
      <Grid xs={12} item>
        <Grid container alignItems="stretch" justifyContent="center" direction="row">
          <Grid item xs={12}>
            <Card className={classes.addDirection}>
              <CardContent>
                <Grid container>
                  <Grid xs={12}>
                    <div>
                      <Button
                        fullWidth
                        size="large"
                        variant="text"
                        onClick={agregarNuevaDireccion}
                        startIcon={
                          <IoAddCircleOutline className={classes.directionIcon} size="1em" />
                        }
                      >
                        <Text text="Agregar otra dirección" />
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  return (
    <form>
      {/* <form onSubmit={handleSubmit(guardar)}> */}
      <Grid container spacing={4}>
        <Grid item xs={12} sm={deshabilitado ? 12 : 8}>
          <Card className={classes.card}>
            <CardContent>
              {!deshabilitado && (
                <Typography className={classes.title}>
                  <Text text="Ingresa los datos del nuevo cliente" />
                </Typography>
              )}
              <Grid container spacing={1}>
                <Grid xs={12} item>
                  <InputText
                    errors={errors}
                    control={control}
                    name="nombre"
                    label="nombre completo"
                    placeholder="ingresa el nombre completo del cliente"
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
                  <InputText
                    errors={errors}
                    control={control}
                    name="rfc"
                    label="R.F.C"
                    placeholder="ingresa el RFC"
                    rules={{
                      required: {
                        message: t('el nombre es requerido'),
                        value: true,
                      },
                      minLength: {
                        message: t('ingresa un rfc con al menos 3 caracteres'),
                        value: 3,
                      },
                      pattern: {
                        message: t('ingresa un rfc con formato válido'),
                        value:
                          /^([A-ZÑ\x26]{3,4}([0-9]{2})(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])([A-Z]|[0-9]){2}([A]|[0-9]){1})?$/,
                      },
                    }}
                    fullWidth
                    required
                    readOnly={deshabilitado}
                  />
                </Grid>
                <Grid xs={6} item>
                  <InputText
                    errors={errors}
                    control={control}
                    name="telefono"
                    label="numero de telefono"
                    placeholder="ingresa el numero de telefono"
                    rules={{
                      required: false,
                      pattern: {
                        value: /[A-Za-z0-9]{10}/,
                        message: t('ingresa un numero telefonico valido'),
                      },
                    }}
                    readOnly={deshabilitado}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid xs={12} sm={6} item>
                  <InputText
                    errors={errors}
                    control={control}
                    name="correo"
                    label="correo electrónico"
                    rules={{
                      required: false,
                      pattern: {
                        value: emailValidation,
                        message: t('ingresa un correo electronico valido'),
                      },
                    }}
                    readOnly={deshabilitado}
                    fullWidth
                  />
                </Grid>
                <Grid xs={12} sm={6} item>
                  <InputText
                    errors={errors}
                    control={control}
                    name="referencia"
                    label="clave"
                    placeholder="ingresa el numero de telefono"
                    rules={{
                      required: {
                        value: false,
                      },
                    }}
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="start">
                          <IoInformationCircleOutline size="1.5em" />
                        </InputAdornment>
                      ),
                    }}
                    readOnly={deshabilitado}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {mostrarDirecciones()}
          {pintarBotonAgregarDireccion()}
        </Grid>
        {pintarBotonesDeAccion()}
      </Grid>
      {openModal && (
        <DialogGeneric
          open={openModal}
          text="¿Deseas eliminar de forma permanente el cliente selecionado?"
          title="Eliminar clientes"
          buttons={botonesBorrar}
          handleClose={() => setOpenModal(false)}
          actions
        />
      )}
    </form>
  )
}

export default ClienteFormulario
