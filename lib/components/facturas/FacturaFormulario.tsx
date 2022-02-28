import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'
import {
  Grid,
  Card,
  CardContent,
  makeStyles,
  createStyles,
  Theme,
  Button,
  Box,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { IoAlertCircleOutline } from 'react-icons/io5'
import { isValidArray } from '@rombomx/ui-commons'
import {
  FacturaFormularioProps,
  FacturaRequest,
  ButtonsDialog,
  SelectOptionsProps,
} from '../../propTypes'
import { FacturaEstatus } from '@rombomx/models'
import { CheckBoxCustom, Text, InputText, DialogGeneric } from '../commons'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'
import ClienteDetalle from './ClienteDetalle'
import ArticulosDetalle from './ArticulosDetalle'
import TotalFlotante from './TotalFlotante'
import { Alert } from '@material-ui/lab'

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
    impuestoIcon: {
      cursor: 'pointer',
      color: theme.palette.primary.main,
    },
    errorText: {
      color: theme.palette.error.main,
      padding: '1em 2em',
    },
    status: {
      color: theme.palette.warning.dark,
      textAlign: 'center',
      verticalAlign: 'middle',
    },
    pac: {
      backgroundColor: theme.palette.warning.light,
      color: theme.palette.warning.contrastText,
      padding: '2em 1em 0.5em 1em',
      margin: '0 0em',
      borderRadius: '10px',
    },
    pacCertified: {
      backgroundColor: theme.palette.success.light,
      padding: '2em 0 1em 0',
      margin: '0 1em',
      borderRadius: '10px',
    },
    floatPadding: {
      [theme.breakpoints.up('sm')]: {
        height: theme.spacing(90),
      },
      [theme.breakpoints.down('xs')]: {
        height: theme.spacing(50),
      },
    },
  }),
)

export const FacturaFormulario = ({
  id,
  guardar,
  factura,
  deshabilitado,
  cfdiCatalog,
  errorsValidation,
  folioSugerido,
}: FacturaFormularioProps): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [openModalCancelar, setOpenModalCancelar] = useState<boolean>(false)
  const [formReset, setFormReset] = useState<boolean>(false)
  const [cliente, setCliente] = useState<SelectOptionsProps>(null)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FacturaRequest>({
    defaultValues: factura,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    criteriaMode: 'firstError',
  })

  const conceptos = useWatch({
    control,
    name: 'conceptos',
    defaultValue: [],
  })

  const certificar = useWatch({
    control,
    name: 'certificar',
    defaultValue: false,
  })

  useEffect(() => {
    if (folioSugerido !== '') {
      setValue('folio', folioSugerido)
    }
  }, [folioSugerido])

  useEffect(() => {
    if (errorsValidation) {
      if (errorsValidation.length === 0) {
        return
      }

      errorsValidation.map((error) => {
        setError(error.nombre, {
          type: 'manual',
          message: t(error.mensaje),
        })
      })
    }
  }, [errorsValidation])

  useEffect(() => {
    if (isValidArray(conceptos)) {
      clearErrors('conceptos')
    }
  }, [conceptos])

  useEffect(() => {
    if (id || deshabilitado) {
      reset(factura)
      if (factura && factura.cliente) {
        setCliente({
          id: factura.cliente.id,
          name: factura.cliente.nombre,
          row: factura.cliente,
        })
      }
    } else {
      reset({
        ...factura,
        fecha: new Date().toISOString().split('T')[0],
      })
    }
  }, [factura, reset])

  const eliminarFactura = () => {
    return 1
  }

  const cancelarFactura = () => {
    return 1
  }

  const limpiarFormulario = () => {
    setValue('clienteId', null)
    setValue('claveUsoCFDI', null)
    setValue('folio', '')
    setValue('rfc', '')
    setValue('fecha', new Date().toISOString().split('T')[0])
    setValue('direccionDeEnvio', null)
    setValue('subtotal', null)
    setValue('descuento', null)
    setValue('total', null)
    setValue('conceptos', [])
    setValue('certificar', false)

    setFormReset(true)
    setTimeout(() => {
      setFormReset(false)
    }, 300)
    clearErrors()
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: () => setOpenModal(false),
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarFactura,
      color: 'primary',
    },
  ]
  const botonesCancelar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: () => setOpenModalCancelar(false),
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: cancelarFactura,
      color: 'primary',
    },
  ]

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
          {id && factura?.estatus !== FacturaEstatus.TIMBRADO && (
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
          {id && factura?.estatus === FacturaEstatus.TIMBRADO && (
            <Grid item xs={12}>
              <Button
                size="large"
                color="secondary"
                variant="outlined"
                fullWidth
                onClick={() => setOpenModal(true)}
              >
                <Text text="cancelar" />
              </Button>
            </Grid>
          )}
          <Grid item xs={12}>
            <Link href="/facturas">
              <Button size="large" color="default" fullWidth>
                <Text text="salir" />
              </Button>
            </Link>
          </Grid>
          <Grid item xs={12}>
            <hr />
          </Grid>
          <Grid item xs={12} className={classes.status}>
            <Grid container spacing={1} alignItems="center" justifyContent="center">
              <Grid item xs={12}>
                <div className={classes.pac}>
                  <CheckBoxCustom
                    label={'Certificar la factura ante el PAC'}
                    control={control}
                    name="certificar"
                    errors={errors}
                  />
                </div>
              </Grid>
              {!certificar ? (
                <Grid item xs={12}>
                  <Alert variant="standard" severity="warning">
                    Recuerda certificar tu factura
                  </Alert>
                </Grid>
              ) : null}
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.floatPadding} />
      </Grid>
    )
  }

  return (
    <form>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={deshabilitado ? 12 : 8}>
          <Card className={classes.card}>
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Text
                    text={
                      deshabilitado
                        ? 'Datos de la factura'
                        : 'Inicia buscando el cliente al que deseas facturarle'
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <InputText
                    type="date"
                    control={control}
                    name="fecha"
                    label="fecha"
                    errors={errors}
                    inputLabelProps={{ shrink: true }}
                    readOnly={deshabilitado}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <InputText
                    control={control}
                    name="folio"
                    label="folio"
                    errors={errors}
                    readOnly={deshabilitado}
                    required
                    fullWidth
                  />
                </Grid>
                <ClienteDetalle
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  cfdiCatalog={cfdiCatalog}
                  formReset={formReset}
                  clearErrors={clearErrors}
                  deshabilitado={deshabilitado}
                  cliente={cliente}
                  direccion={factura?.direccionDeEnvio}
                />
              </Grid>
            </CardContent>
          </Card>
          <ArticulosDetalle
            errors={errors}
            setValueToForm={setValue}
            facturaId={id}
            articulosDefault={factura?.conceptos}
            formReset={formReset}
            clearErrors={clearErrors}
            deshabilitado={deshabilitado}
          />
        </Grid>
        {pintarBotonesDeAccion()}
      </Grid>
      {openModal && (
        <DialogGeneric
          open={openModal}
          text="¿Deseas eliminar de forma permanente la factura selecionada?"
          title="Eliminar factura"
          buttons={botonesBorrar}
          handleClose={() => setOpenModal(false)}
          actions
        />
      )}
      {openModalCancelar && (
        <DialogGeneric
          open={openModalCancelar}
          text="¿Deseas cancelar de forma permanente la factura selecionada?"
          title="Cancelar factura"
          buttons={botonesCancelar}
          handleClose={() => setOpenModalCancelar(false)}
          actions
        />
      )}
      <br />
      <TotalFlotante
        conceptos={conceptos}
        setValueToForm={setValue}
        deshabilitado={deshabilitado}
      />
    </form>
  )
}

export default FacturaFormulario
