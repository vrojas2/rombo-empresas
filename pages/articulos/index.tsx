import { useState, useEffect, FormEventHandler } from 'react'
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
} from '@material-ui/core'
import { DataGrid, GridColDef } from '@material-ui/data-grid'
import {
  IoArrowRedoOutline,
  IoCloudUploadOutline,
  IoPersonAddOutline,
  IoTrashOutline,
  IoSearch,
} from 'react-icons/io5'
import { TFunction, useTranslation } from 'react-i18next'
import { ArticuloDeEmpresa, SearchResults, SatClaveProdServ, SatClaveUnidad } from '@rombomx/models'
import { isValidArray } from '@rombomx/ui-commons'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'

import { getEntityRecord } from '../../lib/services'
import { Page } from '../../lib/layout/main'
import ActionLink from '../../lib/components/commons/ActionLink'
import { useFeedback } from '../../lib/providers/feedback'
import ActionMenu from '../../lib/layout/main/ActionMenu'
import { useErrorHandler } from '../../lib/providers/errors'
import { searchItems, deleteItems, request } from '../../lib/services'
import { debug } from '../../lib/services/logger'
import { ButtonsDialog } from '../../lib/propTypes'
import { DialogGeneric } from '../../lib/components/commons'
import {
  ArticuloDetalleModal,
  ImportArticulosModal,
  ExportArticulosModal,
} from '../../lib/components/articulos'

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
      display: 'flex',
      flexFlow: 'row wrap',
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

export default function ArticulosPage(): JSX.Element {
  const { t } = useTranslation()
  const classes = useStyle()
  const { successMessage, loading } = useFeedback()
  const { handleError } = useErrorHandler()
  const [articulos, setArticulos] = useState<SearchResults<ArticuloDeEmpresa>>()
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<number>()
  const [cargando, setCargando] = useState<boolean>(false)
  const [importarArticulosModal, setImportarArticulos] = useState<boolean>(false)
  const [exportArticulosModal, setExportarArticulosModal] = useState<boolean>(false)
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<Array<number | string>>([])
  const [gridProps, setGridProps] = useState<GridProps>({
    page: 0,
    size: 25,
    sort: 'nombre',
    order: 'ASC',
  })

  async function getUnidadMedida(id: string) {
    let UM: string
    getEntityRecord<SatClaveUnidad>('sat', `unidad-de-medida/por-clave/${id}`)
      .then((data) => {
        UM = `${data.clave}-${data.nombre}`
      })
      .catch((e) => {
        console.error(e)
      })

    return UM
  }

  function getColumns(t: TFunction, classes: ClassNameMap<any>): GridColDef[] {
    return [
      {
        field: 'nombre',
        headerName: t(`nombre del artículo`),
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
              setArticuloSeleccionado(Number(params.id))
              setOpenModal(true)
            }}
          >
            {params.value}
          </Button>
        ),
      },
      {
        field: 'clave',
        headerName: t('clave'),
        editable: false,
        sortable: false,
        width: 130,
        headerClassName: classes.dataGridColumns,
      },
      {
        field: 'unidadMedida',
        headerName: t(`unidad de medida`),
        editable: false,
        sortable: false,
        width: 120,
        headerClassName: classes.dataGridColumns,
        disableExport: true,
        disableReorder: true,
        align: 'center',
      },
      {
        field: 'satClaveProdServId',
        headerName: t(`clave SAT`),
        editable: false,
        sortable: false,
        flex: 3,
        headerClassName: classes.dataGridColumns,
        renderCell: (params) => {
          if (!params.row?.claveProductoServicio) {
            return ''
          }
          return `${params.row?.claveProductoServicio?.clave} - ${params.row?.claveProductoServicio?.descripcion}`
        },
      },
    ]
  }

  const loadArticulos = async (props: GridProps = gridProps) => {
    try {
      setCargando(true)
      setGridProps({ ...props })
      const results = await searchItems<ArticuloDeEmpresa>('articulos', {
        page: props.page + 1,
        pageSize: props.size,
        query: props.search,
      })
      debug('results', results)
      setArticulos(results)
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error cargando informacion'), null, res)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    loadArticulos()
  }, [])

  const searchArticulos: FormEventHandler = async (event) => {
    event.preventDefault()
    debug(event)
    loadArticulos()
  }

  function borrarBusqueda() {
    const _gridProps = { ...gridProps, search: null }
    setGridProps(_gridProps)
    loadArticulos(_gridProps)
  }

  function cerrarBorrado() {
    setModalBorrado(false)
  }

  async function eliminarArticulos() {
    loading('Eliminando articulos')
    try {
      await deleteItems({ selectedIds }, 'articulos', '_delete')
      successMessage('articulos eliminados exitosamente')
      cerrarBorrado()
      await loadArticulos()
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error eliminando articulos'), null, res)
    } finally {
      loading(false)
    }
  }

  function cerrarModalArticulo(fn?: () => void) {
    if (fn) fn()
    setOpenModal(false)
    setArticuloSeleccionado(null)
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarBorrado,
      color: 'secondary',
    },
    {
      title: 'Aceptar',
      onClick: eliminarArticulos,
      color: 'primary',
    },
  ]
  return (
    <Page title={t('listado de articulos')}>
      <Grid container spacing={1} direction="row" justifyContent="center" alignItems="center">
        <Grid item xs={10} sm={6} className={classes.topControl}>
          <form onSubmit={searchArticulos}>
            <TextField
              fullWidth
              margin="none"
              placeholder={t('busqueda por nombre y clave')}
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
                  onClick={() => setImportarArticulos(true)}
                >
                  {t('importar articulos')}
                </Button>
              </Grid>
            </Hidden>
            <Grid xs={2} sm={6} item className={classes.topControl}>
              <ActionLink
                href="/articulos/nuevo"
                icon={<IoPersonAddOutline size={ICON_SIZE} />}
                label={t('agregar articulo')}
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
            label: 'Exportar articulos',
            onClick: () => {
              setExportarArticulosModal(true)
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
            articulos?.items.map(
              ({ id, nombre, clave, unidadMedida, satClaveProdServId, claveProductoServicio }) => ({
                id,
                nombre,
                clave,
                unidadMedida,
                satClaveProdServId,
                claveProductoServicio,
              }),
            ) || []
          }
          loading={cargando}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          rowCount={articulos?.count}
          pageSize={gridProps.size}
          onPageChange={(page) => {
            loadArticulos({ ...gridProps, page })
          }}
          onPageSizeChange={(size) => {
            loadArticulos({ ...gridProps, size })
          }}
          onSelectionModelChange={setSelectedIds}
          disableColumnMenu
          checkboxSelection
          disableSelectionOnClick
        />
      </Paper>

      {articuloSeleccionado && (
        <ArticuloDetalleModal
          id={articuloSeleccionado}
          titulo="del Articulo"
          mostrar={openModal}
          cerrar={cerrarModalArticulo}
          cargarDatos={loadArticulos}
        />
      )}
      {modalBorrado && selectedIds && (
        <DialogGeneric
          open={modalBorrado}
          text="¿Deseas eliminar de forma permanente los articulos selecionados?"
          title="Eliminar articulos"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
      <ImportArticulosModal
        open={importarArticulosModal}
        onClose={() => setImportarArticulos(false)}
      />
      <ExportArticulosModal
        open={exportArticulosModal}
        onClose={() => setExportarArticulosModal(false)}
        ids={selectedIds}
      />
    </Page>
  )
}
