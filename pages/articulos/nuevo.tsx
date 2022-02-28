import { useState, useEffect } from 'react'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'react-i18next'

import { Page } from '../../lib/layout/main'
import { useErrorHandler } from '../../lib/providers/errors'
import { useFeedback } from '../../lib/providers/feedback'
import { createItem } from '../../lib/services'
import {
  getInformacionArticulo,
  getArticuloRequest,
  validaArticuloVariantes,
  ArticuloFormulario,
} from '../../lib/components/articulos'
import { ArticuloRequest, ErrorFormulario, SelectOptionsProps } from '../../lib/propTypes'
import { debug } from '../../lib/services/logger'

/**
 * Componente para mostrar la página de creación de un articulo
 * @returns JSX.Element
 */
const NuevoArticuloPage = (): JSX.Element => {
  const { t } = useTranslation()
  const { loading } = useFeedback()
  const [error, setError] = useState<ErrorFormulario>()
  const [impuestos, setImpuestos] = useState<Array<SelectOptionsProps>>()
  const [clavesSat, setClavesSat] = useState<Array<SelectOptionsProps>>()
  const [clavesUnidades, setClavesUnidades] = useState<Array<SelectOptionsProps>>()
  const { handleError } = useErrorHandler()
  const { successMessage } = useFeedback()
  const router = useRouter()

  const loadArticuloInfo = () => {
    loading(t('cargando información').toString())
    getInformacionArticulo()
      .then((data) => {
        console.log('data', data)
        if (typeof data !== 'string') {
          setImpuestos(data.impuestos)
          setClavesSat(data.clavesSat)
          setClavesUnidades(data.clavesUnidades)
        }
      })
      .catch((e) => {
        handleError(t('error cargando informacion'), null, e)
      })
      .finally(() => loading(false))
  }

  useEffect(() => {
    loadArticuloInfo()
  }, [])

  const crearNuevoArticulo = async (values: ArticuloRequest, callback?: () => void) => {
    const data = getArticuloRequest(values)
    console.log(data)
    const validacion = validaArticuloVariantes(values)
    if (validacion && !validacion.exito && validacion.error) {
      return setError(validacion)
    }
    setError(null)
    try {
      debug('Guardando', values)
      loading(t('creando articulo').toString())
      const data = getArticuloRequest(values)
      console.log(data)
      await createItem(data, 'articulos')
      successMessage('Articulo creado exitosamente')
      if (callback) {
        return callback()
      }
      router.push('/articulos')
    } catch (e) {
      let error = e?.response?.data?.title
      if (e?.response?.data.detail) {
        error += ` ${e?.response?.data.detail}`
      }
      handleError(t('error'), t(error))
    } finally {
      loading(false)
    }
  }

  return (
    <Page title={t('crear nuevo articulo')}>
      <ArticuloFormulario
        impuestos={impuestos}
        clavesSat={clavesSat}
        clavesUnidades={clavesUnidades}
        guardar={crearNuevoArticulo}
        error={error}
      />
    </Page>
  )
}

export default NuevoArticuloPage
