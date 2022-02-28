import { useEffect, useState } from 'react'
import { Grid, Card, makeStyles, createStyles, Theme, TextField } from '@material-ui/core'
import { IoSearch, IoTrashOutline } from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { isValidArray } from '@rombomx/ui-commons'
import { ArticuloDeEmpresa, SearchResults } from '@rombomx/models/lib'

import { Text, AutocompleteField, DialogGeneric } from '../commons'
import {
  ArticulosDetalleProps,
  ButtonsDialog,
  SelectOptionsProps,
  FacturaDetalle,
  ImpuestoArticuloFactura,
} from '../../propTypes'
import { useErrorHandler } from '../../providers/errors'
import { useFeedback } from '../../providers/feedback'
import { deleteItem, request } from '../../services'
import { formatCurrency } from '../../helpers'

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
    itemsHeader: {
      backgroundColor: theme.palette.grey[300],
      padding: '1em 0',
    },
    search: {
      margin: theme.spacing(2),
    },
    deleteIcon: {
      color: theme.palette.error.main,
      cursor: 'pointer',
    },
    articulosError: {
      color: theme.palette.error.main,
      padding: theme.spacing(2),
    },
  }),
)

const ArticulosDetalle = ({
  facturaId,
  errors,
  deshabilitado,
  setValueToForm,
  articulosDefault,
  formReset,
  clearErrors,
}: ArticulosDetalleProps): JSX.Element => {
  const classes = useStyles()
  const [articulos, setArticulos] = useState<Array<FacturaDetalle>>([])
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<number>(null)
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const { successMessage, loading, errorMessage } = useFeedback()
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)

  useEffect(() => {
    if (isValidArray(articulosDefault)) {
      setArticulos(articulosDefault)
    }
  }, [articulosDefault])

  useEffect(() => {
    if (formReset) {
      setArticulos(articulosDefault || [])
    }
  }, [formReset])

  const removerArticulo = () => {
    const _articulos = articulos.filter((imp, i) => i !== articuloSeleccionado)
    setArticulos(_articulos)
    setValueToForm('conceptos', _articulos)
  }

  const borrarArticulo = (index) => {
    setArticuloSeleccionado(index)
    setModalBorrado(true)
  }

  const eliminarArticulo = async () => {
    if (!isValidArray(articulos)) {
      return
    }

    const articuloEncontrado = articulos[articuloSeleccionado]
    if (articuloEncontrado) {
      loading(t('eliminando artículo').toString())
      if (articuloEncontrado.id) {
        try {
          await deleteItem('facturas', `${facturaId}/conceptos/${articuloEncontrado.id}`)
          removerArticulo()
          setModalBorrado(false)
          successMessage(t('artículo eliminado exitosamente'))
          setArticuloSeleccionado(null)
        } catch (e) {
          handleError(t('error'), t(e?.response?.data?.title), e)
        } finally {
          loading(false)
        }
      } else {
        removerArticulo()
        setModalBorrado(false)
        successMessage(t('artículo eliminado exitosamente'))
        setArticuloSeleccionado(null)
        loading(false)
      }
    }
  }

  const cerrarBorrado = () => {
    setModalBorrado(false)
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarBorrado,
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarArticulo,
      color: 'primary',
    },
  ]

  const agregarArticulo = async (articulo) => {
    try {
      clearErrors('conceptos')
      const articuloId = articulo.padreId || articulo.id
      const datosImpuestos = request<Array<ImpuestoArticuloFactura>>(
        'GET',
        'articulos',
        `${articuloId}/impuestos`,
      )

      const articuloExistente = articulos.find(({ id }) => id === articulo.id)
      if (articuloExistente) {
        return handleError(t('Articulo'), t('El artículo ya esta agregado a la factura'))
      }

      const _articulos = [...articulos]

      _articulos.push({
        nombre: articulo.nombre,
        articuloId: articulo.id,
        cantidad: 0,
        descuento: 0,
        descuentoImporte: 0,
        descuentoTasa: 0,
        subtotal: 0,
        valorUnitario: articulo.precio ? +Number(articulo.precio).toFixed(2) : 0,
        importeTotal: 0,
        subtotalConDescuento: 0,
      })
      setArticulos(_articulos)
      const impuestos = await datosImpuestos
      const index = _articulos.findIndex(({ articuloId }) => articuloId === articulo.id)
      if (index !== -1 && isValidArray(impuestos)) {
        const _impuestos = impuestos.map((imp) => {
          if (!imp.impuesto) {
            return
          }
          return {
            id: imp.id,
            tasa: imp.impuesto.valor,
            tipo: imp.impuesto.traslado ? 'Tasa' : 'Retención',
            importe: 0,
            descripcion: `${imp.impuesto.tipo} ${imp.impuesto.nombre}`,
            satImpuestoId: imp.satImpuestoId,
          }
        })
        const __impuestos = _impuestos.filter((imp) => !!imp)
        if (!isValidArray(__impuestos)) {
          errorMessage(
            t(
              'No se puede agregar el articulo, configure los impuestos del artículo correctamente para continuar',
            ).toString(),
          )
          return _articulos.splice(index, 1)
        }
        _articulos[index].impuestos = __impuestos
      }

      setValueToForm('conceptos', _articulos)
    } catch (e) {
      console.error('error', e)
      errorMessage(t('Tenemmos inconvenientes al leer los impuestos del artículo').toString())
    }
  }

  const buscarArticulo = async (data) => {
    if (data) {
      agregarArticulo(data.row)
    }
  }

  const mapper = (data: SearchResults<ArticuloDeEmpresa>): Array<SelectOptionsProps> => {
    return data.items.map((articulo) => ({
      id: articulo.id,
      name: `${articulo.nombre}  ${articulo?.clave || ''}`,
      row: articulo,
    }))
  }

  const onChangeField = (field: string, value: any, index: number): any => {
    const _articulos = [...articulos]
    _articulos[index][field] = value
    let subtotal = 0
    if (
      field === 'valorUnitario' ||
      field === 'cantidad' ||
      (_articulos[index].cantidad && _articulos[index].valorUnitario)
    ) {
      subtotal = +_articulos[index].cantidad * +_articulos[index].valorUnitario
      _articulos[index].subtotal = +subtotal.toFixed(2)
    }

    if (!isNaN(+_articulos[index].descuento) && subtotal !== 0) {
      _articulos[index].descuentoTasa = +_articulos[index].descuento / 100
      _articulos[index].descuentoImporte = subtotal * Number(_articulos[index].descuentoTasa)
    }

    if (field === 'descuento' && subtotal !== 0) {
      _articulos[index].descuentoTasa = +value / 100
      _articulos[index].descuentoImporte = +(
        subtotal * Number(_articulos[index].descuentoTasa)
      ).toFixed(2)
    }

    if (!isNaN(+_articulos[index].descuentoImporte)) {
      _articulos[index].subtotalConDescuento = +(
        subtotal - Number(_articulos[index].descuentoImporte)
      ).toFixed(2)
      _articulos[index].importeTotal = +(
        subtotal - Number(_articulos[index].descuentoImporte)
      ).toFixed(2)
    }

    setArticulos(_articulos)

    if (typeof value !== 'undefined' && value) {
      clearErrors(`conceptos.${index}.${field}`)
    }

    if (isValidArray(_articulos[index].impuestos)) {
      if (!isNaN(+_articulos[index].subtotalConDescuento)) {
        let totalDeImpuestos = 0
        _articulos[index].impuestos.forEach((impuesto) => {
          impuesto.importe = +_articulos[index].subtotalConDescuento * +impuesto.tasa
          totalDeImpuestos += impuesto.importe
        })
        _articulos[index].importeTotal = +_articulos[index].subtotalConDescuento + totalDeImpuestos
      }
    }

    setValueToForm('conceptos', _articulos)
    return value
  }

  const pintarArticulos = () => {
    if (!isValidArray(articulos)) {
      return null
    }

    return articulos.map((field, index) => {
      return (
        <Grid item xs={12} key={`articulos-facturas-${index}`}>
          <Grid container direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <Grid xs={3} item className="text-center">
              {field.nombre}
            </Grid>
            <Grid xs={2} item className="text-center">
              <TextField
                label={t('unidades')}
                InputProps={{ inputProps: { readOnly: deshabilitado } }}
                name={`conceptos.${index}.cantidad`}
                error={!!errors?.conceptos?.[index]?.cantidad}
                helperText={errors?.conceptos?.[index]?.cantidad?.message}
                onChange={(e) => onChangeField('cantidad', e.target.value, index)}
                value={field.cantidad}
                fullWidth
                required
              />
            </Grid>
            <Grid xs={2} item className="text-center">
              <TextField
                label={t('precio')}
                InputProps={{ inputProps: { readOnly: deshabilitado } }}
                onChange={(e) => onChangeField('valorUnitario', e.target.value, index)}
                value={field.valorUnitario}
                error={!!errors?.conceptos?.[index]?.valorUnitario}
                helperText={errors?.conceptos?.[index]?.valorUnitario?.message}
                required
                fullWidth
              />
            </Grid>
            <Grid xs={2} item className="text-center">
              <TextField
                label={t('descuento')}
                InputProps={{ inputProps: { readOnly: deshabilitado } }}
                onChange={(e) => onChangeField('descuento', e.target.value, index)}
                value={field.descuento}
                required
                error={!!errors?.conceptos?.[index]?.descuento}
                helperText={errors?.conceptos?.[index]?.descuento?.message}
                inputProps={{
                  endAdornment: '%',
                }}
                fullWidth
              />
            </Grid>
            <Grid xs={3} item className="text-center">
              <Grid
                container
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item xs={8}>
                  <TextField
                    label={t('importe total')}
                    InputProps={{ inputProps: { readOnly: deshabilitado } }}
                    value={formatCurrency(+field.subtotalConDescuento)}
                    required
                    fullWidth
                    inputProps={{ readOnly: true }}
                  />
                </Grid>
                {!deshabilitado && (
                  <Grid item xs={3}>
                    <IoTrashOutline
                      className={classes.deleteIcon}
                      title="Eliminar Artículo"
                      size="2em"
                      onClick={() => (deshabilitado ? null : borrarArticulo(index))}
                    />
                  </Grid>
                )}
              </Grid>
              {/* {formatCurrency(field.subtotalConDescuento)}{' '} */}
            </Grid>
          </Grid>
        </Grid>
      )
    })
  }

  return (
    <>
      <Card>
        <Grid container>
          <Grid item xs={12}>
            <Grid container>
              <Grid item xs={12} className={classes.search}>
                <Text
                  text={deshabilitado ? 'Artículos' : 'Busca y añade artículos que desees facturar'}
                />
              </Grid>
              <Grid item xs={12} className={classes.search}>
                {deshabilitado ? null : (
                  <AutocompleteField
                    name="articuloSearch"
                    label={t('Buscar articulo').toString()}
                    src="articulos"
                    path="search"
                    errors={errors}
                    disabled={deshabilitado}
                    inputProps={{
                      endAdornment: deshabilitado ? null : <IoSearch />,
                    }}
                    srcMapper={mapper}
                    onChange={buscarArticulo}
                    reset={formReset}
                    clearOnSelect
                    fullWidth
                    freeSolo
                    catalog
                  />
                )}
              </Grid>
              <Grid item xs={12}>
                <Grid
                  container
                  direction="row"
                  justifyContent="space-around"
                  alignItems="center"
                  className={classes.itemsHeader}
                  spacing={1}
                >
                  <Grid xs={2} item className="text-center">
                    <Text text="Nombre del artículo" />
                  </Grid>
                  <Grid xs={2} item className="text-center">
                    <Text text="Unidades" />
                  </Grid>
                  <Grid xs={2} item className="text-center">
                    <Text text="Precio unitario" />
                  </Grid>
                  <Grid xs={2} item className="text-center">
                    <Text text="Descuento (%)" />
                  </Grid>
                  <Grid xs={2} item className="text-center">
                    <Text text="Importe total" />
                  </Grid>
                </Grid>
                <br />
                {pintarArticulos()}
                {errors?.conceptos ? (
                  <Grid item xs={12}>
                    <span className={classes.articulosError}>{errors?.conceptos?.message}</span>
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {modalBorrado && (
          <DialogGeneric
            key={`modal-borrado-impuesto-${Math.random()}`}
            open={modalBorrado}
            text={t('¿Deseas eliminar de la factura de forma permanente el artículo seleccionado?')}
            title="Eliminar artículo de esta factura"
            buttons={botonesBorrar}
            handleClose={cerrarBorrado}
            actions
          />
        )}
      </Card>
    </>
  )
}

export default ArticulosDetalle
