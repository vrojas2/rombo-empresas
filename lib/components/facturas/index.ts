import { Factura, SearchResults, SatUsoCFDI, FacturaFolio } from '@rombomx/models/lib'
import { logger } from '@rombomx/ui-commons'
import { isValidArray } from '@rombomx/ui-commons'
import FacturaDetalleModal from './FacturaDetalleModal'
import ExportFacturasModal from './ExportFacturasModal'
import FacturaFormulario from './FacturaFormulario'
import { request, getEntityRecord } from '../../services'
import { InfoFacturaProps, FacturaRequest, SelectOptionsProps } from '../../propTypes'

const getInformacionFactura = async (id?: number): Promise<InfoFacturaProps | string> => {
  try {
    const cdfiPromise = request<SearchResults<SatUsoCFDI>>('GET', 'sat', 'cfdi', true)
    let folioPromise
    let folio
    if (!id) {
      folioPromise = request<FacturaFolio>('GET', 'facturas', 'folios/sugerido')
    }

    let factura: FacturaRequest = {
      clienteId: null,
      claveUsoCFDI: null,
      folio: '',
      rfc: '',
      fecha: new Date().toISOString().split('T')[0],
      direccionDeEnvio: null,
      descuento: 0,
      subtotal: null,
      total: null,
      certificar: false,
      conceptos: [],
    }
    if (!id) {
      folio = await folioPromise
    }

    const _cdfi = await cdfiPromise
    const cfdi = _cdfi.items.map((__cfdi) => ({
      id: __cfdi.id,
      name: `${__cfdi.cUsoCFDI}-${__cfdi.descripcion}`,
      row: __cfdi,
    }))

    if (id) {
      const facturaPromise = getEntityRecord<Factura>('facturas', `${id}`)
      const _factura = await facturaPromise
      factura = getDataFactura(_factura, cfdi)
    }

    return { factura, cfdi, folio: folio ? folio.folioSugerido : undefined }
  } catch (e) {
    logger.debug('e', e)
    return 'no se pudo cargar la información necesaria'
  }
}

const getDataFactura = (values: Factura, cfdi: Array<SelectOptionsProps>): FacturaRequest => {
  console.log('values', values)
  const data = {
    clienteId: values.clienteId,
    claveUsoCFDI: 0,
    folio: values.folio,
    fecha: typeof values.fecha === 'string' ? values.fecha : values.fecha.toISOString(),
    subtotal: Number(values.subtotal).toFixed(2),
    total: Number(values.total).toFixed(2),
    descuento: Number(values.descuento).toFixed(2),
    impuestos: 0,
    direccionDeEnvio: values.direccionDeEnvio,
    conceptos: values.conceptos.map((concepto) => {
      if (isValidArray(concepto.impuestos)) {
        concepto.impuestos.forEach((impuesto) => {
          impuesto.importe = Number(impuesto.importe)
          return impuesto
        })
      }

      return {
        id: concepto.id,
        nombre: concepto.articulo.nombre,
        articuloId: concepto.articuloId,
        cantidad: Number(concepto.cantidad).toFixed(0),
        valorUnitario: Number(Number(concepto.valorUnitario).toFixed(2)),
        subtotal: Number(Number(concepto.subtotal).toFixed(2)),
        descuento: +concepto.descuentoTasa * 100,
        descuentoImporte: Number(Number(concepto.descuentoImporte).toFixed(2)),
        descuentoTasa: Number(Number(concepto.descuentoTasa).toFixed(2)),
        importeTotal: Number(Number(concepto.importeTotal).toFixed(2)),
        subtotalConDescuento: Number(Number(concepto.subtotalConDescuento).toFixed(2)),
        impuestos: concepto?.impuestos,
      }
    }),
    estatus: values.estatus,
    certificar: false,
    rfc: values.cliente.rfc,
    cliente: values.cliente,
  }

  if (isValidArray(cfdi)) {
    const clave = cfdi.find(({ row }) => row.cUsoCFDI === values.claveUsoCFDI)
    if (clave) {
      data.claveUsoCFDI = clave.id
    }
  }

  return data
}

const getFacturaRequest = (
  values: FacturaRequest,
  cfdiCatalog: Array<SelectOptionsProps>,
): FacturaRequest => {
  const data = { ...values }
  data.subtotal = Number(values.subtotal).toFixed(2)
  data.descuento = Number(values.descuento).toFixed(2)
  data.total = Number(values.total).toFixed(2)
  data.direccionDeEnvio = values.direccionDeEnvio
  data.conceptos.forEach((concepto) => {
    concepto.descuentoImporte = Number(concepto.descuentoImporte).toFixed(2)
    concepto.subtotal = Number(concepto.subtotal).toFixed(2)
    concepto.descuentoTasa = Number(concepto.descuentoTasa).toFixed(2)
    concepto.importeTotal = Number(concepto.importeTotal).toFixed(2)
    concepto.valorUnitario = Number(concepto.valorUnitario).toFixed(2)
    concepto.subtotalConDescuento = Number(concepto.subtotalConDescuento).toFixed(2)
  })

  if (isValidArray(cfdiCatalog)) {
    const clave = cfdiCatalog.find(({ id }) => id === values.claveUsoCFDI)
    console.log('clave', clave)
    if (clave) {
      data.claveUsoCFDI = clave.row.cUsoCFDI
    }
  }

  return data
}

const validaFactura = (
  values: FacturaRequest,
): { errores: any[]; error: boolean; exito: boolean } => {
  const results = { errores: [], error: false, exito: true }
  console.log('values', values)
  if (!values.fecha || values.fecha === null || values.fecha === '') {
    results.errores.push({ nombre: 'fecha', mensaje: 'la fecha es requerida' })
  }

  if (!values.rfc || values.rfc === null || values.rfc === '') {
    results.errores.push({ nombre: 'rfc', mensaje: 'el rfc es requerido' })
  }

  if (!values.claveUsoCFDI || values.claveUsoCFDI === null || values.claveUsoCFDI === 0) {
    results.errores.push({
      nombre: 'claveUsoCFDI',
      mensaje: 'el uso de CFDI es requerido',
    })
  }

  if (!values.folio || values.folio === null || values.folio === '') {
    results.errores.push({ nombre: 'folio', mensaje: 'el folio es requerido' })
  }

  if (!values.clienteId || values.clienteId === null) {
    results.errores.push({
      nombre: 'clienteId',
      mensaje: 'el cliente es requerido',
    })
  }

  if (isValidArray(values.conceptos)) {
    values.conceptos.map((detalle, index) => {
      if (!detalle.cantidad && typeof detalle.cantidad != 'number') {
        results.errores.push({
          nombre: `conceptos.${index}.cantidad`,
          mensaje: 'es requerido',
        })
      }
      if (Number(detalle.cantidad) <= 0) {
        results.errores.push({
          nombre: `conceptos.${index}.cantidad`,
          mensaje: 'debe ser mayor a cero',
        })
      }

      if (!detalle.valorUnitario && typeof detalle.valorUnitario != 'number') {
        results.errores.push({
          nombre: `conceptos.${index}.valorUnitario`,
          mensaje: 'es requerido',
        })
      }

      if (Number(detalle.valorUnitario) <= 0) {
        results.errores.push({
          nombre: `conceptos.${index}.valorUnitario`,
          mensaje: 'debe ser mayor a cero',
        })
      }

      if (!detalle.descuento && typeof detalle.descuento != 'number') {
        results.errores.push({
          nombre: `conceptos.${index}.descuento`,
          mensaje: 'es requerido',
        })
      }

      if (Number(detalle.descuento) < 0 || Number(detalle.descuento) > 99) {
        results.errores.push({
          nombre: `conceptos.${index}.descuento`,
          mensaje: 'el rango debe de ser de 1% a 99%',
        })
      }
    })
  } else {
    results.errores.push({
      nombre: `conceptos`,
      mensaje: 'Debe de ingresar al menos un artículo',
    })
  }

  if (isValidArray(results.errores)) {
    results.error = true
    results.exito = false
  }

  return results
}

export {
  FacturaFormulario,
  FacturaDetalleModal,
  ExportFacturasModal,
  getInformacionFactura,
  validaFactura,
  getDataFactura,
  getFacturaRequest,
}
