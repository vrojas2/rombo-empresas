import { roles } from '@rombomx/ui-commons'
import { PermisoPorModulo, PermisosResponse } from '@rombomx/models'
import { ColaboradorFormulario } from './ColaboradorFormulario'
import { ColaboradorRequest, ErrorFormulario } from '../../../propTypes'

const validaPermisos = (values: ColaboradorRequest): ErrorFormulario => {
  let validacion = { exito: true, error: null }

  if (values.acceso === 'LIMITED') {
    let permisoDefinido = false
    const moduloValues = Object.values(values.permisos)

    moduloValues.map((value) => {
      const funcionalidadValues = Object.values(value)
      console.log('funcionalidadValues', funcionalidadValues)
      funcionalidadValues.map((permiso) => {
        if (permiso) {
          permisoDefinido = true
        }
      })
    })

    if (!permisoDefinido) {
      validacion = { exito: false, error: 'Los permisos son obligatorios' }
    }
  }

  return validacion
}

const obtenerDatosUsuario = (
  values: ColaboradorRequest,
  permisosPorModulo: PermisosResponse,
): ColaboradorRequest => {
  const datos = { ...values }

  // acceso limitado
  if (values.acceso === roles.items[1].codigo) {
    const permisos: Array<PermisoPorModulo> = Object.values(permisosPorModulo.permisos).flatMap(
      (permiso) => permiso,
    )
    const permisosRequest = []
    Object.values(values.permisos).map((permiso) => {
      Object.keys(permiso).map((key) => {
        if (permiso[key]) {
          const permiso = permisos.find((permisoPorModulo) => key === permisoPorModulo.clave)
          if (permiso) {
            permisosRequest.push(permiso)
          }
        }
      })
    })

    datos.permisos = permisosRequest
  } else {
    datos.permisos = undefined
  }

  return datos
}

export { ColaboradorFormulario, validaPermisos, obtenerDatosUsuario }
