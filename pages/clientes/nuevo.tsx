import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'react-i18next'

import { Page } from '../../lib/layout/main'
import { useErrorHandler } from '../../lib/providers/errors'
import { useFeedback } from '../../lib/providers/feedback'
import { createItem } from '../../lib/services'
import { getDataClientes, ClienteFormulario } from '../../lib/components/clientes'
import { ClienteRequest } from '../../lib/propTypes'

const NuevoClientePage = (): JSX.Element => {
  const { t } = useTranslation()
  const { loading } = useFeedback()
  const { handleError } = useErrorHandler()
  const { successMessage } = useFeedback()
  const router = useRouter()

  const crearNuevoCliente = async (values: ClienteRequest, callback?: () => void) => {
    loading(t('creando cliente').toString())
    console.log('Guardando', values)
    try {
      const data = getDataClientes(values)
      await createItem(data, 'clientes')
      successMessage('Cliente creado exitosamente')
      if (callback) {
        return callback()
      }
      router.push('/clientes')
    } catch (e) {
      handleError(t('error'), t(e?.response?.data?.title))
    } finally {
      loading(false)
    }
  }

  return (
    <Page title={t('crear nuevo cliente')}>
      <ClienteFormulario guardar={crearNuevoCliente} />
    </Page>
  )
}

export default NuevoClientePage
