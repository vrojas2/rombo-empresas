import _ from 'lodash'
import { isValidArray } from '@rombomx/ui-commons'
import { logger } from '@rombomx/ui-commons'

import {
  ArticuloDeEmpresa,
  SearchResults,
  SatClaveProdServ,
  SatImpuesto,
  SatClaveUnidad,
  SatUsoCFDI,
} from '@rombomx/models/lib'
import { ArticuloRequest, ArticuloValidationError, InfoArticuloProps } from '../../propTypes'
import ArticuloFormulario from './ArticuloFormulario'
import ArticuloDetalleModal from './ArticuloDetalle'
import ImpuestosFormularioLegacy from './ImpuestosFormulario.legacy'
import ImpuestosFormulario from './ImpuestosFormulario'
import VariantesFormulario from './VariantesFormulario'
import ImportArticulosModal from './ImportArticulosModal'
import ExportArticulosModal from './ExportArticulosModal'
import { isEmptyString } from '../../helpers'
import { request, getEntityRecord } from '../../services'

/**
 * Valida que un articulo que esta marcado con variantes, tenga al menos una ingresada
 * @param values
 * @returns
 */
const validaArticuloVariantes = (values: ArticuloRequest): ArticuloValidationError => {
  let validacion = { exito: true, error: null }
  //Si esta marcado con variantes
  if (values.tieneVariantes) {
    //Si no tiene variantes agregadas
    if (!isValidArray(values.variantes) && !isValidArray(values.articuloCaracteristicas)) {
      validacion = { exito: false, error: 'ingrese al menos una variante' }
    }
    //Si tiene variantes agregadas
    if (isValidArray(values.variantes) && isValidArray(values.articuloCaracteristicas)) {
      let variantesVacias = true
      values.variantes.map((variante) => {
        if (!isEmptyString(variante.precio)) {
          variantesVacias = false
        }
        if (!isEmptyString(variante.clave)) {
          variantesVacias = false
        }
      })
      if (variantesVacias) {
        validacion = {
          exito: false,
          error: 'Debes de llenar todos los campos de al menos una variante',
        }
      }
    }
  }

  return validacion
}

/**
 * Transforma los datos de un articulo con la interfaz ArticuloDeEmpresa a un objeto ArticuloRequest
 * @param values <ArticuloDeEmpresa>
 * @returns data <ArticuloRequest>
 */
const getDataArticulo = (values: ArticuloDeEmpresa): ArticuloRequest => {
  const _articulo: ArticuloRequest = {
    nombre: values.nombre,
    precio: values.precio,
    satClaveProdServId: values.satClaveProdServId,
    clave: values.clave,
    unidadMedida: values.unidadMedida,
    tieneVariantes: false,
    impuestos: [],
    articuloCaracteristicas: [],
    variantes: [],
  }

  if (isValidArray(values.articuloCaracteristicas)) {
    _articulo.tieneVariantes = true
  }

  if (isValidArray(values.articuloCaracteristicas)) {
    _articulo.articuloCaracteristicas = _.orderBy(
      values.articuloCaracteristicas.map((ac) => ({
        caracteristica: ac.caracteristica,
        valor: ac.valor.split(','),
        caracteristicaId: ac.id,
      })),
      ['caracteristicaId'],
      ['asc'],
    )
  }

  if (isValidArray(values.impuestos)) {
    _articulo.impuestos = values.impuestos.map((imp) => ({
      impuesto: imp.satImpuestoId,
      impuestoId: imp.id,
      impuestoRegistro: imp?.impuesto,
    }))
  }

  if (isValidArray(values.variantes)) {
    _articulo.variantes = values.variantes.map((variante) => ({
      nombre: variante.caracteristicas,
      precio: variante.precio,
      clave: variante.clave,
      varianteId: variante.id,
    }))
  }
  return _articulo
}

/**
 * Transforma los datos del formulario para poder ser enviados al backend
 * @param values
 * @returns
 */
const getArticuloRequest = (values: ArticuloRequest): ArticuloRequest => {
  const data: ArticuloRequest = { ...values }
  if (isValidArray(values.impuestos)) {
    const impuestos = []
    values.impuestos.map((impuesto) => {
      if (!!Object.keys(impuesto).length && impuesto.impuesto) {
        impuestos.push(impuesto)
      }
    })
    data.impuestos = impuestos
  }

  if (typeof data.satClaveProdServId === 'string') {
    data.satClaveProdServId = null
  }

  if (isEmptyString(data.clave)) {
    data.clave = null
  }

  if (data.precio === '' || (data.variantes && data.variantes.length > 0)) {
    data.precio = null
  }

  if (data.precio) {
    data.precio = Number(data.precio).toFixed(2)
  }

  if (isEmptyString(data.unidadMedida)) {
    data.unidadMedida = null
  }

  return data
}

const getInformacionArticulo = async (
  id?: number,
  deshabilitado?: boolean,
): Promise<InfoArticuloProps | string> => {
  try {
    let clavesSat
    let clavesUnidades
    let impuestos
    if (!deshabilitado) {
      const clavesSatPromise = request<SearchResults<SatClaveProdServ>>(
        'GET',
        'sat',
        'claves-productos-servicios',
        true,
      )
      const impuestosPromise = request<SearchResults<SatImpuesto>>('GET', 'sat', 'impuestos', true)
      const clavesUnidadesPromise = request<SearchResults<SatClaveUnidad>>(
        'GET',
        'sat',
        'unidad-de-medida',
        true,
      )

      const _clavesSat = await clavesSatPromise
      const _impuestos = await impuestosPromise
      const _clavesUnidades = await clavesUnidadesPromise
      impuestos = _impuestos.items.map((_impuesto) => ({
        id: _impuesto.id,
        name: `${_impuesto.tipo}-${_impuesto.nombre}`,
      }))
      clavesSat = _clavesSat.items.map((_claveSat) => ({
        id: _claveSat.id,
        name: `${_claveSat.clave}-${_claveSat.descripcion}`,
      }))
      clavesUnidades = _clavesUnidades.items.map((_claveUnidad) => ({
        id: _claveUnidad.id,
        name: `${_claveUnidad.clave}-${_claveUnidad.nombre}`,
      }))
    }

    let articulo = null
    if (id) {
      const articuloPromise = getEntityRecord<ArticuloDeEmpresa>('articulos', `${id}`)
      const _articulo = await articuloPromise
      articulo = getDataArticulo(_articulo)
    }

    return { clavesSat, clavesUnidades, impuestos, articulo }
  } catch (e) {
    logger.debug('e', e)
    return 'no se pudo cargar la información necesaria'
  }
}

export {
  getInformacionArticulo,
  getDataArticulo,
  getArticuloRequest,
  validaArticuloVariantes,
  ArticuloFormulario,
  ArticuloDetalleModal,
  ImpuestosFormularioLegacy,
  VariantesFormulario,
  ImportArticulosModal,
  ExportArticulosModal,
}
