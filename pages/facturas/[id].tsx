import { useState, useEffect } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { Page } from '../../lib/layout/main'
import getConfig from 'next/config'

import { useErrorHandler } from '../../lib/providers/errors'
import { useFeedback } from '../../lib/providers/feedback'
import { updateItem, request, createItem } from '../../lib/services'
import {
  FacturaFormulario,
  getInformacionFactura,
  getFacturaRequest,
  validaFactura,
} from '../../lib/components/facturas'
import { FacturaRequest, PageProps, SelectOptionsProps } from '../../lib/propTypes'

const { publicRuntimeConfig } = getConfig()
const { cfdiResource } = publicRuntimeConfig
/**
 * Pinta la página para editar la factura
 *
 * @param {EditarProps} props { id }
 * @returns {JSX.Element}
 */

const EditFacturaPage = ({ id }: PageProps): JSX.Element => {
  const { t } = useTranslation()
  const router = useRouter()
  const [factura, setFactura] = useState<FacturaRequest>(null)
  const [cfdiCatalog, setCFDICatalog] = useState<Array<SelectOptionsProps>>()
  const [errors, setErrors] = useState<Array<{ nombre: string; mensaje: string }>>([])
  const { handleError } = useErrorHandler()
  const { successMessage, loading } = useFeedback()

  const loadFacturaInfo = () => {
    loading(t('cargando información').toString())
    getInformacionFactura(id)
      .then((data) => {
        if (typeof data !== 'string') {
          setCFDICatalog(data.cfdi)
          setFactura(data.factura)
        }
      })
      .catch((e) => {
        handleError(t('error cargando informacion'), null, e)
      })
      .finally(() => loading(false))
  }

  useEffect(() => {
    if (id) {
      loadFacturaInfo()
    }
  }, [id])

  const editarFactura = async (values: FacturaRequest) => {
    const validacion = validaFactura(values)
    console.log('validacion', validacion)
    if (validacion && !validacion.exito && validacion.error) {
      return setErrors(validacion.errores)
    }
    setErrors([])
    loading(t('editando cliente').toString())
    console.log('Guardando', values)
    try {
      const data = getFacturaRequest(values, cfdiCatalog)
      const result = await updateItem(data, 'facturas', `${id}`)
      if (values.certificar) {
        loading(t('certificando Factura').toString())
        await createItem({ facturaId: id }, cfdiResource, 'v33', true)
        await request('PATCH', 'facturas', `${id}/marcar-certificada`)
      }

      console.log('resultados!!!!', result)
      successMessage('Factura creado exitosamente')
      router.push('/facturas')
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error actualizando factura'), null, res)
    } finally {
      loading(false)
    }
  }

  return (
    <Page title={t('editar factura')}>
      <FacturaFormulario
        id={id}
        factura={factura}
        guardar={editarFactura}
        cfdiCatalog={cfdiCatalog}
        errorsValidation={errors}
      />
    </Page>
  )
}

EditFacturaPage.getInitialProps = async (ctx): Promise<any> => {
  const { id } = ctx.query

  return { id: Number(id) }
}

export default EditFacturaPage
