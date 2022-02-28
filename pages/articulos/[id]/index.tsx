import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { isValidArray } from '@rombomx/ui-commons'
import { Page } from '../../../lib/layout/main'
import { useErrorHandler } from '../../../lib/providers/errors'
import { useFeedback } from '../../../lib/providers/feedback'
import { updateItem } from '../../../lib/services'

import {
  getInformacionArticulo,
  validaArticuloVariantes,
  ArticuloFormulario,
  getArticuloRequest,
} from '../../../lib/components/articulos'
import {
  ArticuloRequest,
  ArticuloValidationError,
  PageProps,
  SelectOptionsProps,
} from '../../../lib/propTypes'

/**
 * Componente para mostrar la página de edición de un artículo
 * @returns JSX.Element
 */
const EdicionArticuloPage = ({ id }: PageProps): JSX.Element => {
  const { t } = useTranslation()
  const { loading } = useFeedback()
  const [error, setError] = useState<ArticuloValidationError>()
  const [articulo, setArticulo] = useState<ArticuloRequest>(null)
  const [impuestos, setImpuestos] = useState<Array<SelectOptionsProps>>()
  const [clavesSat, setClavesSat] = useState<Array<SelectOptionsProps>>()
  const [clavesUnidades, setClavesUnidades] = useState<Array<SelectOptionsProps>>()

  const { handleError } = useErrorHandler()
  const { successMessage } = useFeedback()
  const router = useRouter()

  const loadArticuloInfo = () => {
    loading(t('cargando articulo').toString())
    getInformacionArticulo(id)
      .then((data) => {
        if (typeof data !== 'string') {
          setArticulo(data.articulo)
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
    if (id) {
      loadArticuloInfo()
    }
  }, [id])

  const editarArticulo = async (values: ArticuloRequest, callback?: () => void) => {
    const validacion = validaArticuloVariantes(values)
    if (validacion && !validacion.exito && validacion.error) {
      return setError(validacion)
    }
    setError(null)
    try {
      console.log('Verficando variantes eliminadas', values)
      const data = getArticuloRequest(values)
      console.log('data', data)
      if (isValidArray(articulo.variantes)) {
        data.variantesBorradas = []
        articulo.variantes.map((variante) => {
          const varianteExiste = data.variantes.find(
            (_variante) => _variante.nombre === variante.nombre,
          )
          if (!varianteExiste) {
            data.variantesBorradas.push(variante)
          }
        })
      }
      console.log('Guardando', data)
      loading(t('actualizando artículo').toString())
      await updateItem(data, 'articulos', `${id}`)
      successMessage('Artículo guardado exitosamente')
      if (callback) {
        return callback()
      }
      router.push('/articulos')
    } catch (e) {
      handleError(t('error'), t(e?.response?.data?.title))
    } finally {
      loading(false)
    }
  }

  return (
    <Page title={t('editar artículo')}>
      <ArticuloFormulario
        id={id}
        articulo={articulo}
        clavesSat={clavesSat}
        clavesUnidades={clavesUnidades}
        impuestos={impuestos}
        guardar={editarArticulo}
        error={error}
        setArticulo={setArticulo}
      />
    </Page>
  )
}

EdicionArticuloPage.getInitialProps = async (ctx): Promise<any> => {
  const { id } = ctx.query

  return { id: Number(id) }
}

export default EdicionArticuloPage
