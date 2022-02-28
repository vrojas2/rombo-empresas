import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { PermisosResponse } from '@rombomx/models'
import { Page } from '../../../lib/layout/main'
import {
  ColaboradorFormulario,
  validaPermisos,
  obtenerDatosUsuario,
} from '../../../lib/components/configuracion/colaboradores'
import { ColaboradorRequest, ErrorFormulario } from '../../../lib/propTypes'
import { useFeedback } from '../../../lib/providers/feedback'
import { useErrorHandler } from '../../../lib/providers/errors'
import { createItem } from '../../../lib/services'

export const ColaboradorNuevoPage = (): JSX.Element => {
  const { loading, successMessage } = useFeedback()
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const router = useRouter()
  const [error, setError] = useState<ErrorFormulario>()

  const crearColaborador = async (
    values: ColaboradorRequest,
    permisosPorModulo: PermisosResponse,
  ) => {
    try {
      const validacion = validaPermisos(values)
      console.log('validacion', validacion)
      if (validacion && !validacion.exito && validacion.error) {
        return setError(validacion)
      }
      setError(null)
      loading(t('creando colaborador').toString())
      console.log('Guardando', values)
      const usuario = obtenerDatosUsuario(values, permisosPorModulo)
      console.log('usuario', usuario)
      await createItem(usuario, 'usuarios')
      successMessage('Colaborador creado exitosamente')
      router.push('/configuracion/colaboradores')
    } catch (e) {
      handleError(t('error'), t(e?.response?.data?.title))
    } finally {
      loading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <Page title="Agregar colaborador">
      <ColaboradorFormulario guardar={crearColaborador} error={error} clearError={clearError} />
    </Page>
  )
}

export default ColaboradorNuevoPage
