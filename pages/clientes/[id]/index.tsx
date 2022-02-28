import { useState, useEffect } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core'

import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { ClienteDeEmpresa } from '@rombomx/models'

import { Page } from '../../../lib/layout/main'
import { useErrorHandler } from '../../../lib/providers/errors'
import { useFeedback } from '../../../lib/providers/feedback'
import { updateItem } from '../../../lib/services'
import { getEntityRecord } from '../../../lib/services'
import { ClienteFormulario, getDataClientes } from '../../../lib/components/clientes'
import { ClienteRequest, PageProps } from '../../../lib/propTypes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      marginBottom: theme.spacing(2),
      color: theme.palette.text.hint,
    },
    card: {
      marginBottom: theme.spacing(2),
    },
    mainButton: {
      marginBottom: theme.spacing(2),
    },
    mainButtonsGrid: {
      [theme.breakpoints.up('sm')]: {
        position: 'fixed',
        //backgroundColor: 'red',
        padding: 10,
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        right: theme.spacing(2),
      },
      [theme.breakpoints.down('xs')]: {
        padding: theme.spacing(2),
      },
    },
    formGrid: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  }),
)

/**
 * Pinta la página para editar el cliente
 *
 * @param {EditarProps} props { id }
 * @returns {JSX.Element}
 */

const EditarClientePage = ({ id }: PageProps): JSX.Element => {
  const { t } = useTranslation()
  const router = useRouter()
  const [cliente, setCliente] = useState<ClienteRequest>(null)
  const { loading } = useFeedback()
  const { handleError } = useErrorHandler()
  const { successMessage } = useFeedback()

  const loadCliente = () => {
    // setLoading(true)
    getEntityRecord<ClienteDeEmpresa>('clientes', `${id}`)
      .then((clienteInfo) => {
        let telefono = null

        if (Array.isArray(clienteInfo.telefonos) && clienteInfo.telefonos.length > 0) {
          telefono = clienteInfo.telefonos[0]
        }

        const clienteTransform: ClienteRequest = {
          nombre: clienteInfo.nombre,
          rfc: clienteInfo.rfc,
          telefono: telefono ? telefono.numero : null,
          codigoPaisTelefono: null,
          correo: clienteInfo.correoElectronico,
          referencia: clienteInfo.referencia,
          direcciones: clienteInfo.direcciones || [],
        }

        setCliente(clienteTransform)
      })
      .catch((res) => {
        handleError(t(res?.response?.data?.detail || 'error cargando informacion'), null, res)
      })
    //   .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (id) {
      loadCliente()
    }
  }, [id])

  const editarCliente = async (values: ClienteRequest) => {
    loading(t('editando cliente').toString())
    console.log('Guardando', values)
    try {
      const data = getDataClientes(values)
      const result = await updateItem(data, 'clientes', `${id}`)
      console.log('resultados!!!!', result)
      successMessage('Cliente creado exitosamente')
      router.push('/clientes')
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error eliminando clientes'), null, res)
    } finally {
      loading(false)
    }
  }

  return (
    <Page title={t('editar cliente')}>
      <ClienteFormulario id={id} cliente={cliente} guardar={editarCliente}></ClienteFormulario>
    </Page>
  )
}

EditarClientePage.getInitialProps = async (ctx): Promise<any> => {
  const { id } = ctx.query

  return { id: Number(id) }
}

export default EditarClientePage
