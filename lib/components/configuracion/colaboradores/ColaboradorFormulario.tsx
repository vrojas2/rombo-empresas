import {
  Grid,
  makeStyles,
  Paper,
  createStyles,
  Theme,
  Button,
  FormHelperText,
} from '@material-ui/core'
import Link from 'next/link'
import classnames from 'classnames'
import { isValidArray } from '@rombomx/ui-commons'
import { roles } from '@rombomx/ui-commons'
import {
  PermisosResponse,
  PermisoPorModulo,
  UsuarioDeEmpresa,
  UsuarioEstatus,
} from '@rombomx/models'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Text, InputText, RadioField, CheckBoxCustom, SwitchField } from '../../commons'
import { ColaboradorRequest, ColaboradorFormularioProps } from '../../../propTypes'
import { emailValidation } from '../../../constants'
import { getEntityRecord, request } from '../../../services'
import { useFeedback } from '../../../providers/feedback'
import { useErrorHandler } from '../../../providers/errors'

const optionsRoles = roles.items.map((rol) => ({
  value: rol.codigo,
  label: rol.nombre,
}))

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: '2em',
      marginBottom: '2em',
    },
    title: {
      color: '#7C7C7C',
      fontSize: '18px',
      letterSpacing: 0,
      lineHeight: '22px',
      paddingBottom: '2em',
    },
    modulo: {
      fontSize: '18px',
      fontWeight: 'bold',
      letterSpacing: 0,
      lineHeight: '22px',
      textTransform: 'capitalize',
    },
    funcionalidadContenedor: {
      paddingTop: '2em',
      paddingBottom: '4em',
      textTransform: 'capitalize',
    },
    error: {
      color: theme.palette.error.main,
    },
    hrError: {
      borderColor: theme.palette.error.main,
    },
  }),
)
const generaPermisosPorModuloModel = (permisos: PermisosResponse) => {
  const permisosPorModulo = {}
  Object.keys(permisos.permisos).map((key) => {
    const permisosClave = permisos.permisos[key].map((permiso) => permiso.clave)
    const entriesPermisos = permisosClave.map((clave) => [clave, false])
    permisosPorModulo[key] = Object.fromEntries(entriesPermisos)
  })
  return permisosPorModulo
}

const asignarPermisos = (
  colaborador: ColaboradorRequest,
  permisosAsignados: Array<PermisoPorModulo>,
): ColaboradorRequest => {
  if (colaborador.permisos && isValidArray(permisosAsignados)) {
    permisosAsignados.map(({ modulo, clave }) => {
      colaborador.permisos[modulo][clave] = true
    })
  }
  return colaborador
}

export const ColaboradorFormulario = ({
  id,
  guardar,
  error,
  clearError,
}: ColaboradorFormularioProps): JSX.Element => {
  const classes = useStyle()
  const { t } = useTranslation()
  const { loading } = useFeedback()
  const { handleError } = useErrorHandler()
  const [colaborador, setColaborador] = useState<ColaboradorRequest>(null)
  const [permisosPorModulo, setPermisosPorModulo] = useState<PermisosResponse>(null)
  const {
    handleSubmit,
    control,
    reset,
    resetField,
    setValue,
    formState: { errors },
  } = useForm<ColaboradorRequest>({
    defaultValues: colaborador,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  })

  const acceso = useWatch({ control, name: 'acceso' })
  const permisos = useWatch({ control, name: 'permisos' })

  async function cargarDatos(id?: number) {
    try {
      loading('cargando información')
      const permisos = await request<PermisosResponse>('GET', 'usuarios', 'permisos')
      if (id) {
        const usuario = await getEntityRecord<UsuarioDeEmpresa>('usuarios', `${id}`)
        let usuarioColaborador: ColaboradorRequest = {
          id: usuario.id,
          correoElectronico: usuario.correoElectronico,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          acceso: usuario.esAdministrador ? roles.items[0].codigo : roles.items[1].codigo,
          permisos: generaPermisosPorModuloModel(permisos),
          status: usuario.estatus === UsuarioEstatus.ACTIVO,
        }

        if (!usuario.esAdministrador && usuario.permisos) {
          usuarioColaborador = asignarPermisos(usuarioColaborador, usuario.permisos)
        }
        setColaborador(usuarioColaborador)
      }
      setPermisosPorModulo(permisos)
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error cargando informacion'), null, res)
    } finally {
      loading(false)
    }
  }

  useEffect(() => {
    cargarDatos(id)
  }, [])

  useEffect(() => {
    reset(colaborador)
  }, [colaborador])

  useEffect(() => {
    clearError()
  }, [permisos])

  useEffect(() => {
    // acceso Total
    if (acceso === roles.items[0].codigo) {
      resetField('permisos')
    }
  }, [acceso])

  const pintarModuloPermiso = (modulo, funcionalidades) => {
    if (!isValidArray(funcionalidades)) {
      return null
    }
    return (
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        className={classes.funcionalidadContenedor}
      >
        {funcionalidades.map((funcionalidad, i) => {
          return (
            <Grid item xs={3} key={`funcionalidad-${i}`}>
              <CheckBoxCustom
                name={`permisos[${modulo}][${funcionalidad.clave}]`}
                control={control}
                label={funcionalidad.descripcion}
              />
            </Grid>
          )
        })}
      </Grid>
    )
  }

  const pintarAccesos = () => {
    // LIMITED
    if (acceso !== roles.items[1].codigo) {
      return null
    }

    if (!permisosPorModulo || (permisosPorModulo && !permisosPorModulo.permisos)) {
      return null
    }
    const { permisos: permisosModulo } = permisosPorModulo
    const keys = Object.keys(permisosModulo)
    return (
      <>
        {error ? <FormHelperText error>{error.error}</FormHelperText> : null}
        {keys.map((key, i) => {
          return (
            <Grid container key={`modulos-${key}-${i}`}>
              <Grid item xs={12}>
                <Grid container direction="row" alignItems="center" justifyContent="center">
                  <Grid item xs={2}>
                    <Text
                      text={key}
                      className={classnames([classes.modulo, { [classes.error]: !!error }])}
                    />
                  </Grid>
                  <Grid item xs={10}>
                    <hr className={error ? classes.hrError : null} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                {pintarModuloPermiso(key, permisosModulo[key])}
              </Grid>
            </Grid>
          )
        })}
      </>
    )
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={8}>
        <Paper className={classes.paper}>
          <Grid
            container
            spacing={2}
            direction="row"
            alignItems="center"
            justifyContent="flex-start"
          >
            <Grid item xs={12}>
              <Text
                text={`${id ? 'Edita' : 'Agrega'} los datos de tu colaborador`}
                className={classes.title}
              />
            </Grid>
            <Grid item xs={12}>
              <InputText
                name="correoElectronico"
                label={t('Correo electronico')}
                fullWidth
                control={control}
                errors={errors}
                disabled={!!id}
                rules={{
                  required: {
                    message: t('el correo electrónico es requerido'),
                    value: true,
                  },
                  pattern: {
                    message: t('ingrese un correo electrónico válido'),
                    value: emailValidation,
                  },
                  minLength: {
                    message: t('ingresa al menos 3 caracteres'),
                    value: 3,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <InputText
                name="nombre"
                label={t('Nombre')}
                fullWidth
                control={control}
                errors={errors}
                rules={{
                  required: {
                    message: t('el nombre es requerido'),
                    value: true,
                  },
                  minLength: {
                    message: t('ingresa al menos 3 caracteres'),
                    value: 3,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <InputText
                name="apellido"
                label={t('Apellido')}
                fullWidth
                control={control}
                errors={errors}
                rules={{
                  required: {
                    message: t('el apellido es requerido'),
                    value: true,
                  },
                  minLength: {
                    message: t('ingresa al menos 3 caracteres'),
                    value: 3,
                  },
                }}
              />
            </Grid>
            {id ? (
              <Grid item xs={6}>
                <SwitchField
                  control={control}
                  name="status"
                  label="Activo"
                  title="Estatus"
                  errors={errors}
                  defaultValue={colaborador?.status}
                  setValueToForm={setValue}
                />
              </Grid>
            ) : null}
          </Grid>
        </Paper>
        <Paper className={classes.paper}>
          <Grid container spacing={2} direction="row" alignItems="center" justifyContent="center">
            <Grid item xs={12}>
              <Text text="Tipo de Acceso" className={classes.title} />
            </Grid>
            <Grid item xs={12}>
              <RadioField
                name="acceso"
                options={optionsRoles}
                control={control}
                errors={errors}
                rules={{
                  required: {
                    message: t('el acceso es requerido'),
                    value: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              {pintarAccesos()}
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Grid container direction="column" spacing={1}>
          <Grid item xs={12}>
            <Button
              size="large"
              color="primary"
              fullWidth
              onClick={handleSubmit((data) => guardar(data, permisosPorModulo))}
            >
              <Text text="guardar" />
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Link href="/configuracion/colaboradores">
              <Button size="large" color="default" fullWidth>
                <Text text="salir" />
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ColaboradorFormulario
