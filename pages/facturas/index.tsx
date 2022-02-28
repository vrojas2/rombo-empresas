import { useState, useEffect, FormEventHandler, useRef } from 'react'
import _ from 'lodash'
import {
  Grid,
  TextField,
  createStyles,
  makeStyles,
  Theme,
  InputAdornment,
  Button,
  IconButton,
  Divider,
  Hidden,
  Paper,
  Menu,
  MenuItem,
  Checkbox,
  Chip,
} from '@material-ui/core'
import { DataGrid, GridColDef } from '@material-ui/data-grid'

import {
  IoReceiptOutline,
  IoArrowRedoOutline,
  IoPersonAddOutline,
  IoTrashOutline,
  IoSearch,
  IoMailOutline,
  IoCloseOutline,
  IoPrintOutline,
  IoOptionsOutline,
  IoClose,
} from 'react-icons/io5'

import { TFunction, useTranslation } from 'react-i18next'
import { Factura, SearchResults, FacturaEstatus } from '@rombomx/models'
import { isValidArray, FILTROS_FACTURA_FECHA } from '@rombomx/ui-commons'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'
import getConfig from 'next/config'

import { Page } from '../../lib/layout/main'
import ActionLink from '../../lib/components/commons/ActionLink'
import { useFeedback } from '../../lib/providers/feedback'
import ActionMenu, { ActionList } from '../../lib/layout/main/ActionMenu'
import { useErrorHandler } from '../../lib/providers/errors'
import { searchItems, deleteItems, deleteItem, request, execute } from '../../lib/services'
import { debug } from '../../lib/services/logger'
import { ButtonsDialog, DescargaDocs } from '../../lib/propTypes'
import { DialogGeneric, MenuGeneric, Text } from '../../lib/components/commons'
import { FacturaDetalleModal, ExportFacturasModal } from '../../lib/components/facturas'
import { formatDate, descargarArchivoDesdeURL } from '../../lib/helpers'

const pesosMx = Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})
const { publicRuntimeConfig } = getConfig()
const { cfdiResource } = publicRuntimeConfig

const ICON_SIZE = '1em'
interface GridProps {
  page: number
  size: number
  sort: string
  order: string
  cliente?: string
  folio?: string
  fecha?: string
  fechaInicio?: string
  fechaFin?: string
}

const opcionesFiltroFecha = [{ id: '', nombre: 'Seleccione un opción' }].concat(
  FILTROS_FACTURA_FECHA,
)

const TIPO_SELECCION = {
  certificadas: 'certificadas',
  noCertificadas: 'no_certificadas',
  todas: 'todas',
  borrar: 'borrar',
}

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    dataGridContainer: {},
    dataGrid: {
      [theme.breakpoints.down('xs')]: {
        height: `calc(100vh - ${theme.spacing(24)}px)`,
      },
      height: `calc(100vh - ${theme.spacing(20)}px)`,
    },
    dataGridColumns: {
      textTransform: 'capitalize',
    },
    topControl: {
      [theme.breakpoints.up('md')]: {
        marginTop: theme.spacing(-2),
        textAlign: 'right',
      },
    },
    searchBarInput: {
      borderRadius: 50,
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
      marginTop: theme.spacing(1.8),
      fontSize: 'inherit',
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.8em',
      },
    },
    searchBarIconButton: {
      padding: 10,
    },
    speedDial: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
    importButton: {
      width: '100%',
    },
    divider: {
      height: '1.5em',
    },
    gridSearchBtns: {
      [theme.breakpoints.up('sm')]: {
        justifyContent: 'flex-end',
      },
      [theme.breakpoints.down('xs')]: {
        justifyContent: 'flex-start',
      },
      alignItems: 'center',
    },
    link: {
      textDecoration: 'underline',
    },
    statusPending: {
      color: theme.palette.error.contrastText,
      backgroundColor: theme.palette.error.main,
      borderRadius: '10px',
      letterSpacing: 0,
      lineHeight: '19px',
      fontWeight: 'bold',
      padding: '0.2em 1em',
      display: 'flex',
      alignItems: 'center',
      flexFlow: 'row wrap',
      justifyContent: 'center',
    },
    statusCertified: {
      color: theme.palette.success.main,
      letterSpacing: 0,
      lineHeight: '19px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      flexFlow: 'row wrap',
      justifyContent: 'center',
    },
    filters: {
      width: '627px',
      marginTop: '-55px',
      // marginTop: '-14px',
      marginLeft: '12px',
      marginBottom: '10px',
      position: 'absolute',
      zIndex: 1,
      padding: '1.5em',
    },
    searchButton: {
      borderRadius: '20px',
      padding: '0.5em 4em',
    },
    searchButtonContainer: {
      textAlign: 'center',
    },
    minimize: {
      position: 'absolute',
      right: '2px',
      top: '2px',
      cursor: 'pointer',
    },
    filtersSelected: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
      textAlign: 'right',
      marginBottom: '10px',
    },
    chip: {
      margin: '0 2.5px',
    },
  }),
)

export default function FacturasPage(): JSX.Element {
  const { t } = useTranslation()
  const classes = useStyle()
  const { successMessage, loading, attentionMessage } = useFeedback()
  const { handleError } = useErrorHandler()
  const [facturas, setFacturas] = useState<SearchResults<Factura>>()
  const [facturaSeleccionada, setfacturaSeleccionada] = useState<number>()
  const [cargando, setCargando] = useState<boolean>(false)
  const [importarFacturasModal, setImportarFacturas] = useState<boolean>(false)
  const [exportFacturasModal, setExportarFacturasModal] = useState<boolean>(false)
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)
  const [modalBorradoMasivo, setModalBorradoMasivo] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [seleccionadorActivo, setSeleccionadorActivo] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([])
  const [facturaBorrar, setFacturaBorrar] = useState<number | string>(null)
  const [verFiltros, setVerFiltros] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [certificadas, setCertificadas] = useState(false)
  const [descargaLink, setDescargaLink] = useState(null)
  const [linkDescargaMasiva, setLinkDescargaMasiva] = useState(null)
  const anchorRef = useRef(null)
  const anchorRefMasiva = useRef(null)
  const [gridProps, setGridProps] = useState<GridProps>({
    page: 0,
    size: 25,
    sort: 'nombre',
    order: 'ASC',
  })

  useEffect(() => {
    if (facturas && isValidArray(facturas.items)) {
      let noCertificadas = true
      selectedIds.forEach((_id) => {
        const factura = facturas.items.find(({ id }) => id === _id)
        if (factura) {
          if (factura.estatus !== FacturaEstatus.TIMBRADO) {
            noCertificadas = false
          }
        }
      })
      setCertificadas(noCertificadas)
    }
  }, [selectedIds])

  const imprimirFacturasPDF = async () => {
    // try {
    // const file = await request('GET','facturas', `/${}/pdf`)
    // } catch (e) {
    // }
  }

  const certificarFacturas = async () => {
    const facturasParaCertificar = []
    const facturasNoCertificadas = []
    console.log('selectedIds', selectedIds)
    selectedIds.map((id) => {
      const facturaExistente = facturas.items.find(
        (factura: Factura) => factura.id === id && factura.estatus === FacturaEstatus.CREADO,
      )
      if (!facturaExistente) {
        const facturaNoCertificada = facturas.items.find((factura: Factura) => factura.id === id)
        if (!facturaNoCertificada) {
          return
        }
        return facturasNoCertificadas.push(facturaNoCertificada)
      }
      facturasParaCertificar.push(facturaExistente)
    })

    try {
      loading(t('certificando facturas').toString())
      for await (const factura of facturasParaCertificar) {
        loading(t(`certificando factura folio ${factura.folio}`).toString())
        await execute(cfdiResource, '/v33', { facturaId: factura.id }, true)
        await request('PATCH', 'facturas', `${factura.id}/marcar-certificada`)
      }
      if (isValidArray(facturasNoCertificadas)) {
        attentionMessage(
          t(
            `Se certificaron algunas facturas pero hay otras que se encuentran certificadas folios: ${facturasNoCertificadas
              .map(({ folio }) => folio)
              .join(',')}`,
          ),
        )
      } else {
        successMessage(t('Facturas certificadas con éxito'.toString()))
      }
    } catch (e) {
      handleError(t('Error al certificar factura').toString(), e.message)
    } finally {
      loading(false)
    }
  }

  const descargarComprobantesdeFacturas = async () => {
    try {
      loading(t('descargando los comprobantes de las facturas').toString())
      const data: DescargaDocs = await execute(
        cfdiResource,
        '/comprobantes',
        { facturasIds: selectedIds },
        true,
      )

      if (isValidArray(data.facturasNoDescargadas)) {
        const facturasFallidas = []

        facturas.items.map(({ id, folio }) => {
          data.facturasNoDescargadas.map(({ facturaId }) => {
            if (facturaId == id) {
              facturasFallidas.push(folio)
            }
          })
        })

        if (isValidArray(facturasFallidas)) {
          attentionMessage(
            t(
              `Las facturas con los siguientes folios no pudieron ser descargadas ${facturasFallidas.join(
                ',',
              )}`,
            ),
          )
        }
      }

      await setLinkDescargaMasiva(data.url)
      anchorRefMasiva.current.click()
    } catch (e) {
      handleError(t('Error al descargar documentos').toString(), e.message)
    } finally {
      loading(false)
    }
  }

  const botonesCertificadas: ActionList = [
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Exportar excel',
      onClick: () => {
        setExportarFacturasModal(true)
      },
    },
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Descargar PDF y XML',
      onClick: descargarComprobantesdeFacturas,
    },
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Enviar por correo en formato PDF y XML',
      onClick: () => {
        setExportarFacturasModal(true)
      },
    },
    {
      icon: <IoTrashOutline size={ICON_SIZE} />,
      label: 'Cancelar Factura',
      onClick: () => {
        setModalBorrado(true)
      },
    },
  ]

  const botonesNoCertificadas: ActionList = [
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Exportar excel',
      onClick: () => {
        setExportarFacturasModal(true)
      },
    },
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Certificar',
      onClick: certificarFacturas,
    },
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Imprimir PDF',
      onClick: imprimirFacturasPDF,
    },
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Enviar por correo PDF',
      onClick: () => {
        setExportarFacturasModal(true)
      },
    },
    {
      icon: <IoArrowRedoOutline size={ICON_SIZE} />,
      color: 'primary',
      label: 'Descargar PDF',
      onClick: () => {
        setExportarFacturasModal(true)
      },
    },
    {
      icon: <IoTrashOutline size={ICON_SIZE} />,
      label: 'Eliminar',
      onClick: () => {
        setModalBorradoMasivo(true)
      },
    },
  ]

  const obtenerNombreDeCliente = (cliente) => {
    if (!cliente) {
      return ''
    }

    return cliente.nombre
  }

  const seleccionarTodos = (e) => {
    setSeleccionadorActivo((activo) => !activo)
    setAnchorEl(e.currentTarget)
  }

  const cerrarSeleccionarTodos = () => {
    setSeleccionadorActivo(false)
    setAnchorEl(null)
  }

  const seleccionarUno = (params) => {
    const { id } = params
    const findIndex = selectedIds.findIndex((_id) => id === _id)
    if (findIndex !== -1) {
      const _selectedIds = [...selectedIds]
      _selectedIds.splice(findIndex, 1)
      setSelectedIds(_selectedIds)
    } else {
      setSelectedIds([...selectedIds, id])
    }
    setSeleccionadorActivo(false)
    setAnchorEl(null)
  }

  function getColumns(t: TFunction, classes: ClassNameMap<any>): GridColDef[] {
    return [
      {
        field: 'id',
        headerName: '',
        editable: false,
        sortable: false,
        width: 80,
        headerClassName: classes.dataGridColumns,
        renderHeader: () => (
          <>
            <Checkbox
              aria-controls="selector-opciones"
              color="primary"
              indeterminate={seleccionadorActivo}
              onChange={seleccionarTodos}
            />
            <Menu
              id="selector-opciones"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={cerrarSeleccionarTodos}
            >
              <MenuItem onClick={() => seleccionarFacturas(TIPO_SELECCION.certificadas)}>
                <Text text="Seleccionar certificadas" />
              </MenuItem>
              <MenuItem onClick={() => seleccionarFacturas(TIPO_SELECCION.noCertificadas)}>
                <Text text="Seleccionar No certificadas" />
              </MenuItem>
              <MenuItem onClick={() => seleccionarFacturas(TIPO_SELECCION.todas)}>
                <Text text="Seleccionar todas" />
              </MenuItem>
              <MenuItem onClick={() => seleccionarFacturas(TIPO_SELECCION.borrar)}>
                <Text text="Borrar selección" />
              </MenuItem>
            </Menu>
          </>
        ),
        renderCell: (params) => (
          <Checkbox
            checked={!!selectedIds.find((id) => params.id === id)}
            inputProps={{ 'aria-label': 'primary checkbox' }}
            onChange={() => seleccionarUno(params)}
            color="primary"
          />
        ),
      },
      {
        field: 'fecha',
        headerName: t(`fecha`),
        editable: false,
        sortable: false,
        width: 130,
        headerClassName: classes.dataGridColumns,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            className={classes.link}
            onClick={() => {
              setfacturaSeleccionada(Number(params.id))
              setOpenModal(true)
            }}
          >
            {formatDate(params.value.toString())}
          </Button>
        ),
      },
      {
        field: 'folio',
        headerName: t('folio'),
        editable: false,
        sortable: false,
        flex: 1,
        headerClassName: classes.dataGridColumns,
      },
      {
        field: 'cliente',
        headerName: t(`cliente`),
        editable: false,
        sortable: false,
        flex: 3,
        headerClassName: classes.dataGridColumns,
        renderCell: (params) => <span>{obtenerNombreDeCliente(params.value)}</span>,
      },
      {
        field: 'total',
        headerName: t(`monto total`),
        editable: false,
        sortable: false,
        flex: 2,
        headerClassName: classes.dataGridColumns,
        headerAlign: 'right',
        align: 'right',
        valueFormatter: ({ row }) => `$${pesosMx.format(row.total)}`,
      },
      {
        field: 'estatus',
        headerName: t(`Certificada`),
        editable: false,
        sortable: false,
        width: 120,
        headerClassName: classes.dataGridColumns,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          if (params.value === FacturaEstatus.TIMBRADO) {
            return (
              <div className={classes.statusCertified}>
                <Text text="Certificada" />
              </div>
            )
          }
          return (
            <div className={classes.statusPending}>
              <Text text="Pendiente" />
            </div>
          )
        },
      },
      {
        field: '',
        headerName: '',
        editable: false,
        sortable: false,
        width: 150,
        headerClassName: classes.dataGridColumns,
        renderCell: (params) => {
          const certificarFactura = async () => {
            try {
              loading(t('certificando factura').toString())
              // await execute(cfdiResource, '/v40', { facturaId: params.id }, true)
              await execute(cfdiResource, '/v33', { facturaId: params.id }, true)
              await request('PATCH', 'facturas', `${params.id}/marcar-certificada`, false)
              await loadFacturas()
            } catch (e) {
              handleError(t('Error al certificar factura').toString(), e.message)
            } finally {
              loading(false)
            }
          }

          const imprimir = async () => {
            try {
              console.log('imprimir', params)
              if (params.row.estatus !== FacturaEstatus.TIMBRADO) {
                // loading(t('generando pdf...').toString())
                // generacion de PDF para facturas no certificadsa
                // await request('GET', '', '')
              } else {
                loading(t('descargando pdf...').toString())
                const fileUrl: { url: string } = await request<{ url: string }>(
                  'GET',
                  'facturas',
                  `${params.id}/pdf`,
                )
                window.open(fileUrl.url, '_blank')
              }
            } catch (e) {
              handleError(t('Error al traer el archivo').toString(), e.message)
            } finally {
              loading(false)
            }
          }

          const enviarCorreo = async () => {
            console.log('enviarCorreo', params)
          }

          const cancelarFactura = async () => {
            console.log('cancelarFactura', params)
          }

          const eliminarFactura = async () => {
            console.log('eliminarFactura', params)
            setFacturaBorrar(params.id)
            setModalBorrado(true)
          }

          const menuOpciones = [
            {
              title: 'Imprimir',
              action: imprimir,
              icon: IoPrintOutline,
            },
            {
              title: 'Enviar por correo',
              action: enviarCorreo,
              icon: IoMailOutline,
            },
            {
              title: 'Cancelar factura',
              action: cancelarFactura,
              icon: IoCloseOutline,
            },
          ]

          if (params.row.estatus !== FacturaEstatus.TIMBRADO) {
            menuOpciones.splice(0, 0, {
              title: 'Certificar',
              action: certificarFactura,
              icon: IoReceiptOutline,
            })

            menuOpciones.splice(3, 0, {
              title: 'Eliminar factura',
              action: eliminarFactura,
              icon: IoTrashOutline,
            })
          }
          return (
            <>
              <MenuGeneric options={menuOpciones} />
              <a ref={anchorRef} href={descargaLink} hidden>
                descargar factura
              </a>
            </>
          )
        },
      },
    ]
  }

  const loadFacturas = async (props: GridProps = gridProps) => {
    try {
      setCargando(true)
      setGridProps({ ...props })

      const results = await searchItems<Factura>('facturas', {
        page: props.page + 1,
        pageSize: props.size,
        parameters: {
          cliente: props.cliente && props.cliente !== '' ? props.cliente : undefined,
          fecha: props.fecha,
          folio: props.folio && props.folio !== '' ? props.folio : undefined,
          fechaInicio: props.fechaInicio,
          fechaFin: props.fechaFin,
        },
      })

      setFacturas(results)
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error cargando informacion'), null, res)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    loadFacturas()
  }, [])

  const searchFacturas: FormEventHandler = async (event) => {
    event.preventDefault()
    debug(event)
    loadFacturas()
    cerrarFiltros()
  }

  const borrarBusqueda = () => {
    const _gridProps = {
      ...gridProps,
      cliente: '',
      folio: '',
      fecha: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
    }
    setGridProps(_gridProps)
    loadFacturas(_gridProps)
  }

  const borrarBusquedaIndividual = (index: string) => {
    const _gridProps = {
      ...gridProps,
    }

    if (index === 'cliente' || index === 'folio') {
      _gridProps[index] = ''
    } else if (index === 'fecha') {
      _gridProps[index] = undefined
      _gridProps.fechaInicio = undefined
      _gridProps.fechaFin = undefined
    } else {
      _gridProps[index] = undefined
    }

    setGridProps(_gridProps)
    loadFacturas(_gridProps)
  }

  const cerrarBorrado = () => {
    setModalBorrado(false)
  }

  const cerrarBorradoMasivo = () => {
    setModalBorradoMasivo(false)
  }

  const eliminarFacturas = async () => {
    loading('Eliminando facturas')
    try {
      const data = await deleteItems({ selectedIds }, 'facturas', '_delete')
      await loadFacturas()
      if (data && isValidArray(data.noEliminated)) {
        attentionMessage(
          t(
            'Se eliminaron algunas facturas pero hay otras que se encuentran certificadas y no se eliminaron, en su defecto se debe cancelarlas',
          ),
        )
      } else {
        successMessage('facturas eliminadas exitosamente')
      }
      cerrarBorradoMasivo()
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error eliminando facturas'), null, res)
    } finally {
      loading(false)
    }
  }

  const eliminarFactura = async () => {
    loading('Eliminando factura')
    try {
      await deleteItem('facturas', `${facturaBorrar}`)
      successMessage('factura eliminada exitosamente')
      cerrarBorrado()
      await loadFacturas()
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error eliminando factura'), null, res)
    } finally {
      loading(false)
    }
  }

  const cerrarModalFactura = (fn?: () => void) => {
    if (fn) fn()
    setOpenModal(false)
    setfacturaSeleccionada(null)
  }

  const cerrarFiltros = () => {
    setVerFiltros(false)
  }

  const mostrarFiltros = (e) => {
    e.preventDefault()
    setVerFiltros((filter) => !filter)
  }

  const mostrarBorrado = () => {
    if ((gridProps.cliente && gridProps.cliente !== '') || gridProps.folio || gridProps.fecha) {
      return true
    }
    return false
  }

  const asignarFiltro = (e) => {
    // fecha personalizada
    if (e.target.name === 'fechaInicio' || e.target.name === 'fechaFind') {
      return setGridProps({
        ...gridProps,
        fecha: opcionesFiltroFecha[5].id,
        [e.target.name]: e.target.value,
      })
    }

    setGridProps({ ...gridProps, [e.target.name]: e.target.value })
  }

  const filtrarFacturasPorEstatus = (_estatus?: string, contrary = false): Array<number> => {
    if (!_estatus) {
      return facturas.items.map(({ id }) => id)
    }

    const facturasFiltradas = facturas.items.filter(({ estatus }) => {
      if (contrary) {
        return estatus !== _estatus
      }
      return estatus === _estatus
    })

    if (!isValidArray(facturasFiltradas)) {
      return []
    }
    return facturasFiltradas.map(({ id }) => id)
  }

  const seleccionarFacturas = (criterio) => {
    if (isValidArray(facturas.items)) {
      switch (criterio) {
        case TIPO_SELECCION.certificadas:
          setSelectedIds(filtrarFacturasPorEstatus(FacturaEstatus.TIMBRADO))
          setCertificadas(true)
          break
        case TIPO_SELECCION.noCertificadas:
          setSelectedIds(filtrarFacturasPorEstatus(FacturaEstatus.TIMBRADO, true))
          setCertificadas(false)
          break
        case TIPO_SELECCION.todas:
          setSelectedIds(filtrarFacturasPorEstatus())
          setCertificadas(false)
          break
        case TIPO_SELECCION.borrar:
          setSelectedIds([])
          setCertificadas(false)
          break
        default:
          break
      }
    }
    setAnchorEl(null)
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarBorrado,
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarFactura,
      color: 'primary',
    },
  ]

  const botonesBorrarMasivo: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarBorradoMasivo,
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarFacturas,
      color: 'primary',
    },
  ]

  const pintarFiltrosSelecionados = () => {
    const filtros = []
    if (gridProps.fecha) {
      if (gridProps.fechaFin || gridProps.fechaInicio) {
        filtros.push({ id: 'fecha', label: t('Fecha').toString() })
      } else {
        filtros.push({ id: 'fecha', label: t('Fecha').toString() })
      }
    }

    if (gridProps.folio) {
      filtros.push({ id: 'folio', label: t('Folio').toString() })
    }

    if (gridProps.cliente) {
      filtros.push({ id: 'cliente', label: t('Cliente').toString() })
    }

    if (!isValidArray(filtros)) {
      return null
    }

    return (
      <div className={classes.filtersSelected}>
        Filtros:
        {filtros.map((filtro) => (
          <Chip
            label={filtro.label}
            onClick={() => null}
            onDelete={() => borrarBusquedaIndividual(filtro.id)}
            deleteIcon={<IoClose />}
            color="primary"
            variant="outlined"
            className={classes.chip}
          />
        ))}
      </div>
    )
  }
  return (
    <Page title={t('listado de facturas')}>
      <Grid container spacing={1} direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={10} sm={6} className={classes.topControl}>
          <form onSubmit={searchFacturas}>
            <TextField
              fullWidth
              margin="none"
              name="cliente"
              placeholder={t('buscar factura por nombre de cliente')}
              variant="outlined"
              onChange={asignarFiltro}
              value={gridProps.cliente}
              InputProps={{
                margin: 'dense',
                className: classes.searchBarInput,
                startAdornment: (
                  <InputAdornment position="start">
                    <>
                      {mostrarBorrado() ? (
                        <>
                          <Button
                            variant="text"
                            type="button"
                            color="primary"
                            onClick={borrarBusqueda}
                          >
                            Borrar
                          </Button>
                          <Divider orientation="vertical" className={classes.divider} />
                        </>
                      ) : null}

                      <IconButton
                        type="submit"
                        color="primary"
                        className={classes.searchBarIconButton}
                        aria-label="cliente"
                      >
                        <IoSearch size="1em" />
                      </IconButton>
                    </>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <>
                      <IconButton
                        type="submit"
                        color="primary"
                        className={classes.searchBarIconButton}
                        aria-label="filters-menu"
                        onClick={mostrarFiltros}
                        aria-controls="filters-menu"
                        aria-haspopup="true"
                      >
                        <IoOptionsOutline size="1em" />
                      </IconButton>
                    </>
                  </InputAdornment>
                ),
              }}
            />
          </form>
          {pintarFiltrosSelecionados()}
        </Grid>
        <Grid xs={2} sm={6} item className={classes.topControl}>
          <ActionLink
            href="/facturas/nuevo"
            icon={<IoPersonAddOutline size={ICON_SIZE} />}
            label={t('crear nueva factura')}
            color="primary"
          />
        </Grid>
      </Grid>
      {verFiltros ? (
        <Paper elevation={3} className={classes.filters}>
          <IoCloseOutline onClick={cerrarFiltros} className={classes.minimize} size="1.5em" />
          <Grid container direction="column" spacing={1} justifyContent="center">
            <Grid item xs={12}>
              <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                <Grid item xs={3}>
                  <Text text="Buscar por fecha" />
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    select
                    margin="none"
                    name="fecha"
                    variant="outlined"
                    onChange={asignarFiltro}
                    value={gridProps.fecha}
                  >
                    {isValidArray(opcionesFiltroFecha)
                      ? opcionesFiltroFecha.map((opcion, i) => {
                          return (
                            <MenuItem key={`opcion-filtro-fecha-${i}`} value={opcion.id}>
                              <Text text={opcion.nombre} />
                            </MenuItem>
                          )
                        })
                      : null}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            {gridProps.fecha && gridProps.fecha === opcionesFiltroFecha[5].id ? (
              <Grid item xs={12}>
                <Grid
                  container
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      margin="none"
                      label={t('fecha inicio')}
                      name="fechaInicio"
                      value={gridProps.fechaInicio}
                      placeholder={t('fecha inicio')}
                      variant="outlined"
                      onChange={asignarFiltro}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        max: gridProps.fechaFin,
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="date"
                      margin="none"
                      label={t('fecha de fin')}
                      name="fechaFin"
                      value={gridProps.fechaFin}
                      placeholder={t('fecha de fin')}
                      variant="outlined"
                      onChange={asignarFiltro}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: gridProps.fechaInicio,
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            ) : null}
            <Grid item xs={12}>
              <Grid container direction="row" justifyContent="flex-start" alignItems="center">
                <Grid item xs={3}>
                  <Text text="Buscar por folio" />
                </Grid>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    name="folio"
                    margin="none"
                    value={gridProps.folio}
                    placeholder={t('ingresa el numero de folio')}
                    variant="outlined"
                    onChange={asignarFiltro}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid xs={12}>
              <Grid container direction="row" justifyContent="center" alignItems="center">
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    color="secondary"
                    className={classes.searchButton}
                    onClick={borrarBusqueda}
                  >
                    <Text text="limpiar" />
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.searchButton}
                    onClick={searchFacturas}
                  >
                    <Text text="buscar" />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      ) : null}
      <ActionMenu
        show={selectedIds.length > 0}
        bottomMargin={1}
        actionList={certificadas ? botonesCertificadas : botonesNoCertificadas}
      />
      <Paper className={classes.dataGridContainer}>
        <DataGrid
          density="compact"
          className={classes.dataGrid}
          columns={getColumns(t, classes)}
          rows={
            facturas?.items.map(({ id, fecha, folio, cliente, total, estatus }) => ({
              id,
              fecha,
              folio,
              cliente,
              total,
              estatus,
            })) || []
          }
          loading={cargando}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          rowCount={facturas?.count}
          pageSize={gridProps.size}
          onPageChange={(page) => {
            loadFacturas({ ...gridProps, page })
          }}
          onPageSizeChange={(size) => {
            loadFacturas({ ...gridProps, size })
          }}
          selectionModel={selectedIds}
          disableColumnMenu
          disableSelectionOnClick
        />
      </Paper>

      {facturaSeleccionada && (
        <FacturaDetalleModal
          id={facturaSeleccionada}
          titulo="de la factura"
          mostrar={openModal}
          cerrar={cerrarModalFactura}
          cargarDatos={loadFacturas}
        />
      )}
      {modalBorradoMasivo && selectedIds && (
        <DialogGeneric
          open={modalBorradoMasivo}
          text="¿Deseas eliminar de forma permanente los facturas selecionadas?"
          title="Eliminar facturas"
          buttons={botonesBorrarMasivo}
          handleClose={cerrarBorradoMasivo}
          actions
        />
      )}
      {modalBorrado && facturaBorrar && (
        <DialogGeneric
          open={modalBorrado}
          text="¿Deseas eliminar de forma permanente la factura selecionada?"
          title="Eliminar factura"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
      {/*
      <ExportFacturasModal
        open={exportFacturasModal}
        onClose={() => setExportarFacturasModal(false)}
        ids={selectedIds}
      /> */}
      <a href={linkDescargaMasiva} ref={anchorRefMasiva} download={true} hidden>
        descargar comprobantes de facturas
      </a>
    </Page>
  )
}
