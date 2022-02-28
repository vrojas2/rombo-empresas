import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  makeStyles,
  createStyles,
  Theme,
  Button,
  TextField,
} from '@material-ui/core'
import { ClienteDeEmpresa, SearchResults, Direccion } from '@rombomx/models/lib'
import { isValidArray } from '@rombomx/ui-commons'
import { IoSearch, IoRepeatOutline } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { ClienteDetalleProps, SelectOptionsProps } from '../../propTypes'
import { Text, InputText, SelectCustom, AutocompleteField } from '../commons'
import DireccionesModal from './DireccionesModal'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardHeader: {
      backgroundColor: theme.palette.grey[200],
      padding: theme.spacing(2),
      fontSize: '1.2em',
    },
    containerBtnChange: {
      textAlign: 'center',
      padding: 'auto',
    },
    btnChange: {
      padding: '0.5em 5em',
    },
  }),
)

const ClienteDetalle = ({
  control,
  errors,
  deshabilitado,
  setValue,
  cfdiCatalog,
  formReset,
  clearErrors,
  cliente,
  direccion,
}: ClienteDetalleProps): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()

  const [direccionEnLinea, setDireccionEnLinea] = useState<string>()
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<Direccion>()
  const [openModal, setOpenModal] = useState<boolean>()
  const [direcciones, setDirecciones] = useState<Array<Direccion>>([])

  useEffect(() => {
    if (formReset) {
      setDirecciones([])
      setDireccionEnLinea(null)
      setDireccionSeleccionada(null)
    }
  }, [formReset])

  useEffect(() => {
    if (direccion) {
      setDireccionEnLinea(direccion)
    }
  }, [direccion])

  const obtenerDireccion = (__direccion) => {
    if (!__direccion) {
      setValue('direccionDeEnvio', null)
      return ''
    }

    const { direccion: calle, municipio, ciudad, estado, codigoPostal, pais } = __direccion
    const direccionValue = `${calle || ''} ${municipio || ''} ${ciudad || ''} ${estado || ''} ${
      codigoPostal || ''
    } ${pais || ''}`
    setDireccionSeleccionada(__direccion)
    setValue('direccionDeEnvio', direccionValue)
    setDireccionEnLinea(direccionValue)
  }

  const buscarCliente = (data) => {
    if (data && data.row) {
      setValue('rfc', data.row.rfc)
      setValue('clienteId', data.row.id)
    }
    clearErrors('clienteId')
    clearErrors('rfc')
    if (isValidArray(data.row.direcciones)) {
      setDirecciones(data.row.direcciones)
      const _direccion = data.row.direcciones.find(({ principal }) => !!principal)
      if (_direccion) {
        obtenerDireccion(_direccion)
      } else {
        obtenerDireccion(data.row.direcciones[0])
      }
    } else {
      setDireccionEnLinea(t('--Sin dirección--').toString())
      setDireccionSeleccionada(null)
      setDirecciones([])
      obtenerDireccion(null)
    }
  }

  const cambioCliente = (value) => {
    if (value === '') {
      setValue('rfc', '')
      setDireccionEnLinea(null)
      setDireccionSeleccionada(null)
    }
  }

  const mapper = (data: SearchResults<ClienteDeEmpresa>): Array<SelectOptionsProps> => {
    return data.items.map((client) => ({
      id: client.id,
      name: `${client.nombre} ${client?.correoElectronico || ''}  ${
        client?.telefonos?.[0]?.numero || ''
      }`,
      row: client,
    }))
  }

  const mostrarDirecciones = () => {
    setOpenModal(true)
  }

  const closeDireccionModal = (direccionNueva) => {
    setOpenModal(false)
    obtenerDireccion(direccionNueva)
  }

  return (
    <Grid item xs={12}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {deshabilitado ? (
            <TextField
              label={t('Cliente')}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                inputProps: {
                  readOnly: deshabilitado,
                },
              }}
              name="cliente"
              value={cliente?.name}
              fullWidth
            />
          ) : (
            <AutocompleteField
              name="clienteId"
              label={t('Buscar cliente').toString()}
              src="clientes"
              errors={errors}
              inputProps={{
                endAdornment: deshabilitado ? null : <IoSearch />,
              }}
              srcMapper={mapper}
              onChangeInput={cambioCliente}
              onChange={buscarCliente}
              defaultValue={cliente}
              reset={formReset}
              fullWidth
              freeSolo
            />
          )}
        </Grid>
        <Grid item xs={6}>
          <InputText
            control={control}
            name="rfc"
            label="RFC"
            errors={errors}
            // disabled={deshabilitado}
            required
            fullWidth
            readOnly
          />
        </Grid>
        <Grid item xs={6}>
          <SelectCustom
            errors={errors}
            control={control}
            name="claveUsoCFDI"
            defaultValue=""
            label="Uso de CFDI"
            // disabled={deshabilitado}
            readOnly={deshabilitado}
            options={cfdiCatalog}
            autoWidth
          />
        </Grid>
        {direccionEnLinea ? (
          <Grid item xs={12}>
            <Card>
              <div className={classes.cardHeader}>
                <Text text="Dirección" />
              </div>
              <CardContent>
                <Text text={direccionEnLinea || ''} />
              </CardContent>
            </Card>
          </Grid>
        ) : null}
        {Array.isArray(direcciones) && direcciones.length > 1 ? (
          <Grid item xs={12}>
            <div className={classes.containerBtnChange}>
              <Button
                color="primary"
                startIcon={<IoRepeatOutline />}
                className={classes.btnChange}
                onClick={mostrarDirecciones}
              >
                <Text text="Cambiar dirección" />
              </Button>
            </div>
          </Grid>
        ) : null}
      </Grid>
      {openModal && direccionSeleccionada ? (
        <DireccionesModal
          open={openModal}
          direcciones={direcciones}
          direccionSeleccionada={direccionSeleccionada}
          onClose={closeDireccionModal}
        />
      ) : null}
    </Grid>
  )
}

export default ClienteDetalle
