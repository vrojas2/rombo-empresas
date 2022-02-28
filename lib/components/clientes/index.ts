import { ClienteRequest } from '../../propTypes'
import ClienteFormulario from './ClienteFormulario'
import ClienteDetalle from './ClienteDetalle'
import DireccionFormulario from './DirecionFormulario'

/**
 * Comprueba que una cadena este vacia
 * @param value <string>
 * @returns res <boolean>
 */
const isEmptyString = (value: string) => !(typeof value === 'string' && value.length > 0)

/**
 * Comprueba las direcciones y si no tiene un dato por lo menos lleno las elimina
 * @param values <ClienteRequest>
 * @returns data <ClienteRequest>
 */
const getDataClientes = (values: ClienteRequest): ClienteRequest => {
  const data: ClienteRequest = { ...values }
  if (Array.isArray(values.direcciones) && values.direcciones.length > 0) {
    values.direcciones.map((direccion, i) => {
      if (
        Object.keys(direccion).length > 0 &&
        isEmptyString(direccion.direccion) &&
        isEmptyString(direccion.codigoPostal) &&
        isEmptyString(direccion.municipio) &&
        isEmptyString(direccion.ciudad) &&
        isEmptyString(direccion.estado) &&
        isEmptyString(direccion.pais)
      ) {
        data.direcciones.splice(i, 1)
      }
    })
  }

  return data
}

export { isEmptyString, getDataClientes, ClienteFormulario, ClienteDetalle, DireccionFormulario }
