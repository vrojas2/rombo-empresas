import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { Page } from '../../../lib/layout/main'
import {
  ColaboradorFormulario,
  validaPermisos,
  obtenerDatosUsuario,
} from '../../../lib/components/configuracion/colaboradores'
import { PermisosResponse } from '@rombomx/models'
import { ColaboradorRequest, PageProps, ErrorFormulario } from '../../../lib/propTypes'
import { useFeedback } from '../../../lib/providers/feedback'
import { useErrorHandler } from '../../../lib/providers/errors'
import { updateItem } from '../../../lib/services'

const EditarColaboradorPage = ({ id }: PageProps): JSX.Element => {
  const router = useRouter()
  const { t } = useTranslation()
  const { loading, successMessage } = useFeedback()
  const { handleError } = useErrorHandler()
  const [error, setError] = useState<ErrorFormulario>()

  const editarColaborador = async (
    values: ColaboradorRequest,
    permisosPorModulo: PermisosResponse,
  ) => {
    try {
      console.log('values', values)
      const validacion = validaPermisos(values)
      console.log('validacion', validacion)
      if (validacion && !validacion.exito && validacion.error) {
        return setError(validacion)
      }
      setError(null)
      loading(t('actualizando colaborador').toString())
      console.log('Guardando', values)
      const usuario = obtenerDatosUsuario(values, permisosPorModulo)
      console.log('usuario', usuario)
      await updateItem(usuario, 'usuarios', `${id}`)
      successMessage('Colaborador actualizado exitosamente')
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
    <Page title="Editar colaborador">
      <ColaboradorFormulario
        id={id}
        guardar={editarColaborador}
        error={error}
        clearError={clearError}
      />
    </Page>
  )
}

EditarColaboradorPage.getInitialProps = async (ctx): Promise<any> => {
  const { id } = ctx.query

  return { id: Number(id) }
}

export default EditarColaboradorPage
