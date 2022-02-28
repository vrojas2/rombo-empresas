import {
  Grid,
  TextField,
  IconButton,
  makeStyles,
  Paper,
  InputAdornment,
  Hidden,
  createStyles,
  Theme,
  Button,
  Divider,
} from '@material-ui/core'
import { IoSearch } from 'react-icons/io5'
import { DataGrid, GridColDef } from '@material-ui/data-grid'
import { useState, useEffect, FormEventHandler } from 'react'
import { TFunction, useTranslation } from 'react-i18next'
import { ClienteDeEmpresa, SearchResults } from '@rombomx/models/lib'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'

import { useFeedback } from '../../lib/providers/feedback'
import { Page } from '../../lib/layout/main'
import ActionMenu from '../../lib/layout/main/ActionMenu'
import { useErrorHandler } from '../../lib/providers/errors'
import { searchItems, deleteItems } from '../../lib/services'
import {
  IoArrowRedoOutline,
  IoCloudUploadOutline,
  IoPersonAddOutline,
  IoTrashOutline,
} from 'react-icons/io5'

import ActionLink from '../../lib/components/commons/ActionLink'
import { ClienteDetalleModal } from '../../lib/components/clientes/ClienteDetalle'
import DialogGeneric from '../../lib/components/commons/DialogGeneric'
import { ButtonsDialog } from '../../lib/propTypes'
import { debug } from '../../lib/services/logger'
import ImportClientsModal from '../../lib/components/clientes/ImportClientesModal'
import ExportClientesModal from '../../lib/components/clientes/ExportClientesModal'

const ICON_SIZE = '1em'
interface GridProps {
  page: number
  size: number
  sort: string
  order: string
  search?: string
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
  }),
)

const ClientesIndexPage = (): JSX.Element => {
  const { t } = useTranslation()
  const classes = useStyle()
  const { successMessage, loading } = useFeedback()
  const { handleError } = useErrorHandler()
  const [clientes, setClientes] = useState<SearchResults<ClienteDeEmpresa>>()
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number>()
  const [cargando, setCargando] = useState<boolean>(false)
  const [importarClientesModal, setImportarClientes] = useState<boolean>(false)
  const [exportClientesModal, setExportarClientesModal] = useState<boolean>(false)
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([])
  const [gridProps, setGridProps] = useState<GridProps>({
    page: 0,
    size: 25,
    sort: 'nombre',
    order: 'ASC',
  })

  const loadClientes = async (props: GridProps = gridProps) => {
    try {
      setCargando(true)
      setGridProps({ ...props })
      const results = await searchItems<ClienteDeEmpresa>('clientes', {
        page: props.page + 1,
        pageSize: props.size,
        query: props.search,
      })
      debug('results', results)
      setClientes(results)
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error cargando informacion'), null, res)
    } finally {
      setCargando(false)
    }
  }

  const searchClientes: FormEventHandler = async (event) => {
    event.preventDefault()
    debug(event)
    loadClientes()
  }

  useEffect(() => {
    loadClientes()
  }, [])

  function borrarBusqueda() {
    const _gridProps = { ...gridProps, search: null }
    setGridProps(_gridProps)
    loadClientes(_gridProps)
  }

  function cerrarModalCliente(fn?: () => void) {
    if (fn) fn()
    setOpenModal(false)
    setClienteSeleccionado(null)
  }

  async function eliminarClientes() {
    loading('Eliminando clientes')
    try {
      await deleteItems({ selectedIds }, 'clientes', '_delete')
      successMessage('Clientes eliminados exitosamente')
      cerrarBorrado()
      await loadClientes()
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error eliminando clientes'), null, res)
    } finally {
      loading(false)
    }
  }

  function cerrarBorrado() {
    setModalBorrado(false)
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarBorrado,
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarClientes,
      color: 'primary',
    },
  ]

  function getColumns(t: TFunction, classes: ClassNameMap<any>): GridColDef[] {
    return [
      {
        field: 'nombre',
        headerName: t(`razon social`),
        editable: false,
        sortable: false,
        flex: 2,
        headerClassName: classes.dataGridColumns,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            className={classes.link}
            onClick={() => {
              setClienteSeleccionado(params.row.id)
              setOpenModal(true)
            }}
          >
            {params.value}
          </Button>
        ),
      },
      {
        field: 'telefono',
        headerName: t('telefono'),
        editable: false,
        sortable: false,
        width: 150,
        headerClassName: classes.dataGridColumns,
      },
      {
        field: 'correoElectronico',
        headerName: t(`correo electronico`),
        editable: false,
        sortable: false,
        flex: 1,
        headerClassName: classes.dataGridColumns,
      },
      {
        field: 'rfc',
        headerName: t(`RFC`),
        editable: false,
        sortable: false,
        width: 150,
        headerClassName: classes.dataGridColumns,
      },
      {
        field: 'referencia',
        headerName: t('clave'),
        editable: false,
        sortable: false,
        width: 120,
        headerClassName: classes.dataGridColumns,
      },
    ]
  }

  return (
    <Page title={t('listado de clientes')}>
      <Grid container spacing={1} direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={10} sm={6} className={classes.topControl}>
          <form onSubmit={searchClientes}>
            <TextField
              fullWidth
              margin="none"
              placeholder={t('busqueda por nombre, RFC o telefono')}
              variant="outlined"
              onChange={(data) => {
                setGridProps({ ...gridProps, search: data.target.value })
              }}
              value={gridProps.search || ''}
              InputProps={{
                margin: 'dense',
                className: classes.searchBarInput,

                endAdornment: (
                  <InputAdornment position="end">
                    <>
                      {gridProps.search && gridProps.search !== '' ? (
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
                        aria-label="search"
                      >
                        <IoSearch size="1em" />
                      </IconButton>
                    </>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Grid>
        <Grid item xs={2} sm={6}>
          <Grid container spacing={1} className={classes.gridSearchBtns}>
            <Hidden xsDown>
              <Grid xs={6} item className={classes.topControl}>
                <Button
                  color="secondary"
                  startIcon={<IoCloudUploadOutline size={ICON_SIZE} />}
                  className={classes.importButton}
                  onClick={() => setImportarClientes(true)}
                >
                  {t('importar clientes')}
                </Button>
              </Grid>
            </Hidden>
            <Grid xs={2} sm={6} item className={classes.topControl}>
              <ActionLink
                href="/clientes/nuevo"
                icon={<IoPersonAddOutline size={ICON_SIZE} />}
                label={t('agregar cliente')}
                color="primary"
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ActionMenu
        show={selectedIds.length > 0}
        bottomMargin={1}
        actionList={[
          {
            icon: <IoArrowRedoOutline size={ICON_SIZE} />,
            color: 'primary',
            label: 'Exportar clientes',
            onClick: () => {
              setExportarClientesModal(true)
            },
          },
          {
            icon: <IoTrashOutline size={ICON_SIZE} />,
            label: 'Eliminar',
            onClick: () => {
              setModalBorrado(true)
            },
          },
        ]}
      />
      <Paper className={classes.dataGridContainer}>
        <DataGrid
          density="compact"
          className={classes.dataGrid}
          columns={getColumns(t, classes)}
          rows={
            clientes?.items.map(
              ({ id, nombre, rfc, telefonos, correoElectronico, referencia }) => ({
                id,
                nombre,
                rfc,
                telefono:
                  Array.isArray(telefonos) && telefonos.length > 0
                    ? telefonos.find(({ telefonoPorDefecto }) => telefonoPorDefecto === true).numero
                    : null,
                correoElectronico,
                referencia,
              }),
            ) || []
          }
          loading={cargando}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          rowCount={clientes?.count}
          pageSize={gridProps.size}
          onPageChange={(page) => {
            loadClientes({ ...gridProps, page })
          }}
          onPageSizeChange={(size) => {
            loadClientes({ ...gridProps, size })
          }}
          onSelectionModelChange={setSelectedIds}
          disableColumnMenu
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>

      {clienteSeleccionado && (
        <ClienteDetalleModal
          id={clienteSeleccionado}
          titulo="del Cliente"
          mostrar={openModal}
          cerrar={cerrarModalCliente}
          cargarDatos={loadClientes}
        />
      )}
      {modalBorrado && selectedIds && (
        <DialogGeneric
          open={modalBorrado}
          text="¿Deseas eliminar de forma permanente los clientes selecionados?"
          title="Eliminar clientes"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
      <ImportClientsModal open={importarClientesModal} onClose={() => setImportarClientes(false)} />
      <ExportClientesModal
        open={exportClientesModal}
        onClose={() => setExportarClientesModal(false)}
        ids={selectedIds}
      />
    </Page>
  )
}

export default ClientesIndexPage
