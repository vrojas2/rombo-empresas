import { Grid, makeStyles, Paper, createStyles, Theme, Button, Box } from '@material-ui/core'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { TFunction, useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { DataGrid, GridColDef } from '@material-ui/data-grid'
import { ClassNameMap } from '@material-ui/core/styles/withStyles'
import { UsuarioDeEmpresa, SearchResults, UsuarioEstatus } from '@rombomx/models/lib'
import { Page } from '../../../lib/layout/main'
import { DialogGeneric, Text } from '../../../lib/components/commons'
import { ButtonsDialog } from '../../../lib/propTypes'
import { useFeedback } from '../../../lib/providers/feedback'
import { useErrorHandler } from '../../../lib/providers/errors'
import { searchItems, deleteItem } from '../../../lib/services'
import { debug } from '../../../lib/services/logger'

interface GridProps {
  page: number
  size: number
  sort: string
  order: string
  search?: string
}

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    dataGridContainer: {
      marginTop: theme.spacing(3),
    },
    dataGrid: {
      [theme.breakpoints.down('xs')]: {
        height: `calc(100vh - ${theme.spacing(28)}px)`,
      },
      height: `calc(100vh - ${theme.spacing(32)}px)`,
    },
    dataGridColumns: {
      textTransform: 'capitalize',
    },
    btn: {
      margin: theme.spacing(1),
      paddingLeft: '3em',
      paddingRight: '3em',
    },
    addbtn: {
      padding: '1em 5em',
    },
    speedDial: {
      position: 'absolute',
      bottom: theme.spacing(2),
      right: theme.spacing(2),
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

export const ColaboradorListadoPage = (): JSX.Element => {
  const classes = useStyle()
  const { t } = useTranslation()
  const router = useRouter()
  const { successMessage, loading } = useFeedback()
  const { handleError } = useErrorHandler()
  const [usuarios, setUsuarios] = useState<SearchResults<UsuarioDeEmpresa>>(null)
  const [usuario, setUsuario] = useState<UsuarioDeEmpresa>(null)
  const [modalBorrado, setModalBorrado] = useState(false)
  const [cargando, setCargando] = useState<boolean>(false)

  const [gridProps, setGridProps] = useState<GridProps>({
    page: 0,
    size: 25,
    sort: 'nombre',
    order: 'ASC',
  })

  useEffect(() => {
    loadUsuarios()
  }, [])

  const cerrarBorrado = () => {
    setModalBorrado(false)
  }

  const eliminarColaborador = async () => {
    loading('Eliminando colaborador')
    try {
      await deleteItem('usuarios', `${usuario.id}`)
      successMessage('Usuario eliminado exitosamente')
      cerrarBorrado()
      await loadUsuarios()
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error eliminando colaborador'), null, res)
    } finally {
      loading(false)
    }
  }

  const botonesBorrar: Array<ButtonsDialog> = [
    {
      title: 'Cancelar',
      onClick: cerrarBorrado,
      color: 'default',
    },
    {
      title: 'Aceptar',
      onClick: eliminarColaborador,
      color: 'primary',
    },
  ]

  const loadUsuarios = async (props: GridProps = gridProps) => {
    try {
      setCargando(true)
      setGridProps({ ...props })
      const results = await searchItems<UsuarioDeEmpresa>('usuarios', {
        page: props.page + 1,
        pageSize: props.size,
        query: props.search,
      })
      debug('results', results)
      setUsuarios(results)
    } catch (res) {
      handleError(t(res?.response?.data?.detail || 'error cargando informacion'), null, res)
    } finally {
      setCargando(false)
    }
  }

  const editar = (id) => {
    router.push(`/configuracion/colaboradores/${id}`)
  }

  const eliminar = (row) => {
    setUsuario(row)
    setModalBorrado(true)
  }

  function getColumns(t: TFunction, classes: ClassNameMap<any>): GridColDef[] {
    return [
      {
        field: 'correoElectronico',
        headerName: t(`Correo electrónico`),
        editable: false,
        sortable: false,
        width: 400,
        headerClassName: classes.dataGridColumns,
      },
      {
        field: 'esAdministrador',
        headerName: t('acceso'),
        editable: false,
        sortable: false,
        width: 200,
        headerClassName: classes.dataGridColumns,
        renderCell: (params) => (params.value ? t('Total') : t('Limitado')),
      },
      {
        field: 'estatus',
        headerName: t(`estado`),
        editable: false,
        sortable: false,
        width: 150,
        headerClassName: classes.dataGridColumns,
      },
      {
        field: '',
        editable: false,
        sortable: false,
        minWidth: 150,
        flex: 1,
        headerClassName: classes.dataGridColumns,
        renderCell: (params) => {
          return (
            <>
              <Button
                size="small"
                color="primary"
                onClick={() => editar(params.id)}
                className={classes.btn}
              >
                <Text text="Editar" />
              </Button>
              <Button
                size="small"
                color="secondary"
                onClick={() => eliminar(params.row)}
                className={classes.btn}
              >
                <Text text="Eliminar" />
              </Button>
            </>
          )
        },
      },
    ]
  }

  return (
    <Page title="Administrar colaboradores">
      <Grid container direction="row" justifyContent="flex-end" spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Link href="colaboradores/nuevo">
            <Button color="primary" fullWidth>
              <Text text="Agregar colaborador" />
            </Button>
          </Link>
        </Grid>
      </Grid>
      <Paper className={classes.dataGridContainer}>
        <DataGrid
          className={classes.dataGrid}
          columns={getColumns(t, classes)}
          rows={
            usuarios?.items.map(({ id, correoElectronico, esAdministrador, estatus }) => ({
              id,
              correoElectronico,
              esAdministrador,
              estatus,
            })) || []
          }
          loading={cargando}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          rowCount={usuarios?.count}
          pageSize={gridProps.size}
          onPageChange={(page) => {
            loadUsuarios({ ...gridProps, page })
          }}
          onPageSizeChange={(size) => {
            loadUsuarios({ ...gridProps, size })
          }}
          disableColumnMenu
          disableSelectionOnClick
        />
      </Paper>
      {modalBorrado && usuario && (
        <DialogGeneric
          open={modalBorrado}
          text={`¿Deseas eliminar de forma permanente a el colaborador ${usuario.correoElectronico}?`}
          title="Eliminar colaborador"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
    </Page>
  )
}

export default ColaboradorListadoPage
