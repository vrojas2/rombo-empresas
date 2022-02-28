import { useState, useEffect } from 'react'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'react-i18next'
import getConfig from 'next/config'
import { Page } from '../../lib/layout/main'
import { useErrorHandler } from '../../lib/providers/errors'
import { useFeedback } from '../../lib/providers/feedback'
import { createItem, request } from '../../lib/services'
import {
  getInformacionFactura,
  getFacturaRequest,
  validaFactura,
  FacturaFormulario,
} from '../../lib/components/facturas'
import { FacturaRequest, SelectOptionsProps } from '../../lib/propTypes'
import { debug } from '../../lib/services/logger'

const { publicRuntimeConfig } = getConfig()
const { cfdiResource } = publicRuntimeConfig

/**
 * Componente para mostrar la página de creación de un Factura
 * @returns JSX.Element
 */
const NuevaFacturaPage = (): JSX.Element => {
  const { t } = useTranslation()
  const { loading } = useFeedback()
  const [cfdiCatalog, setCFDICatalog] = useState<Array<SelectOptionsProps>>()
  const [factura, setFactura] = useState<FacturaRequest>()
  const [folioSugerido, setFolioSugerido] = useState<string>(null)
  const [errors, setErrors] = useState<Array<{ nombre: string; mensaje: string }>>([])
  const { handleError } = useErrorHandler()
  const { successMessage } = useFeedback()
  const router = useRouter()

  const loadFacturaInfo = () => {
    loading(t('cargando información').toString())
    getInformacionFactura()
      .then((data) => {
        if (typeof data !== 'string') {
          setCFDICatalog(data.cfdi)
          setFactura(data.factura)
          setFolioSugerido(data.folio)
        }
      })
      .catch((e) => {
        handleError(t('error cargando informacion'), null, e)
      })
      .finally(() => loading(false))
  }

  useEffect(() => {
    loadFacturaInfo()
  }, [])

  const crearNuevaFactura = async (values: FacturaRequest, callback?: () => void) => {
    const validacion = validaFactura(values)
    if (validacion && !validacion.exito && validacion.error) {
      return setErrors(validacion.errores)
    }
    setErrors([])
    try {
      debug('Guardando', values)
      loading(t('creando Factura').toString())
      const data = getFacturaRequest(values, cfdiCatalog)
      const creado: any = await createItem(data, 'facturas')
      console.log('creado', creado)
      if (values.certificar) {
        loading(t('certificando Factura').toString())
        const facturaId = Number(creado.resource)
        await createItem({ facturaId }, cfdiResource, 'v33', true)
        await request('PATCH', 'facturas', `${facturaId}/marcar-certificada`)
      }

      successMessage('Factura creado exitosamente')
      if (callback) {
        return callback()
      }
      router.push('/facturas')
    } catch (e) {
      let error = e?.response?.data?.title
      if (e?.response?.data.detail) {
        error += ` ${e?.response?.data.detail}`
      }
      if (!e.response) {
        error = e
      }
      handleError(t('error'), t(error))
    } finally {
      loading(false)
    }
  }

  return (
    <Page title={t('crear nueva Factura')}>
      <FacturaFormulario
        guardar={crearNuevaFactura}
        cfdiCatalog={cfdiCatalog}
        factura={factura}
        errorsValidation={errors}
        folioSugerido={folioSugerido}
      />
    </Page>
  )
}

export default NuevaFacturaPage
