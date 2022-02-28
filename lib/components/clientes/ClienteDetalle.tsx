import { PropsWithChildren, useEffect, useState, useRef } from 'react'
import {
  Grid,
  makeStyles,
  Hidden,
  createStyles,
  Theme,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Menu,
  IconButton,
  useTheme,
  Typography,
} from '@material-ui/core'

import { useRouter } from 'next/router'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTranslation } from 'react-i18next'
import {
  IoEllipsisVertical,
  IoCloseOutline,
  IoPencilOutline,
  IoTrashOutline,
} from 'react-icons/io5'
import ClienteFormulario from './ClienteFormulario'
import { ClienteDeEmpresa } from '../../../../../shared/models/lib'
import { useErrorHandler } from '../../providers/errors'
import { getEntityRecord } from '../../services'
import { ClienteRequest, BotonesDetalle, DetailProps, ButtonsDialog } from '../../propTypes'
import { deleteItem } from '../../services'

import { DialogGeneric, Text } from '../commons'
import { useFeedback } from '../../providers/feedback'

const ICON_SIZE = '1em'

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
    options: {
      textAlign: 'right',
    },
    typography: {
      padding: theme.spacing(2),
    },
    paper: {
      marginRight: theme.spacing(0),
      minWidth: '16rem',
    },
    dialogTitle: {
      boxShadow:
        '0px 2px 1px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      letterSpacing: 0,
      lineHeight: '29px',
      [theme.breakpoints.up('sm')]: {
        marginTop: theme.spacing(2),
      },
    },
    inputLabelProps: {
      color: '#3b3b3b',
    },
    content: {
      [theme.breakpoints.down('xs')]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
      },
    },
    iconBtn: {
      padding: 0,
    },
  }),
)

export const ClienteDetalleModal = ({
  id,
  mostrar,
  titulo,
  cerrar,
  cargarDatos,
}: PropsWithChildren<DetailProps>): JSX.Element => {
  const classes = useStyle()
  const theme = useTheme()
  const router = useRouter()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const anchorRef = useRef<HTMLButtonElement>(null)
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const { loading, successMessage } = useFeedback()
  const [botonPrincipalMovil, setbotonPrincipalMovil] = useState<BotonesDetalle>()
  const [abrirMenu, setabrirMenu] = useState<boolean>(false)
  const [botonesMovil, setBotonesMovil] = useState<Array<BotonesDetalle>>()
  const [cliente, setCliente] = useState<ClienteRequest>()
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)
  const prevAbrirMenu = useRef(abrirMenu)

  const inputLabelProps = {
    classes: classes.inputLabelProps,
  }

  const eliminarCliente = () => {
    loading(t('eliminando cliente').toString())
    deleteItem<ClienteDeEmpresa>('clientes', `${id}`)
      .then((res) => {
        cargarDatos()
        cerrar()
        successMessage('Cliente eliminado exitosamente')
      })
      .catch((e) => {
        handleError(t('error al eliminar el cliente'), null, e)
      })
      .finally(() => loading(false))
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
      onClick: eliminarCliente,
      color: 'primary',
    },
  ]

  const botonesPrincipales: Array<BotonesDetalle> = [
    {
      titulo: 'Editar datos',
      color: 'primary',
      onClick: (fn) => {
        if (fn) fn()
        router.push(`clientes/${id}`)
      },
      principal: true,
      icono: <IoPencilOutline size="1em" />,
    },
    {
      titulo: 'Eliminar cliente',
      color: 'secondary',
      onClick: () => setModalBorrado(true),
      icono: <IoTrashOutline size="1em" />,
    },
    {
      titulo: 'Salir',
      onClick: cerrar,
      color: 'default',
      variante: 'outlined',
    },
  ]

  const loadCliente = () => {
    loading(t('cargando cliente').toString())
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
      .catch((e) => {
        handleError(t('error cargando informacion'), null, e)
      })
      .finally(() => loading(false))
  }

  useEffect(() => {
    loadCliente()
    if (Array.isArray(botonesPrincipales) && botonesPrincipales.length > 0) {
      const btnMain = botonesPrincipales.find((btn) => btn.principal)
      if (btnMain) {
        setbotonPrincipalMovil(btnMain)
      }

      setBotonesMovil(botonesPrincipales)
    }
  }, [])

  useEffect(() => {
    if (anchorRef && anchorRef.current && prevAbrirMenu.current === true && abrirMenu === false) {
      anchorRef.current!.focus()
    }

    prevAbrirMenu.current = abrirMenu
  }, [abrirMenu])

  function mostrarMenu() {
    setabrirMenu((prevAbrirMenu) => !prevAbrirMenu)
  }

  function pintarBotonesPrincipales(): Array<JSX.Element> {
    return botonesPrincipales.map((button, i) => {
      return (
        <Grid item key={`detail-mains-button-${i}`} xs={12}>
          <Button
            fullWidth
            size="large"
            variant={button.variante}
            color={button.color}
            onClick={() => button.onClick(mostrarMenu)}
          >
            {t(button.titulo)}
          </Button>
        </Grid>
      )
    })
  }

  function pintarBotonesMovil(): JSX.Element {
    return (
      <Menu id="simple-menu" anchorEl={anchorRef.current} open={abrirMenu} onClose={mostrarMenu}>
        {botonesMovil.map((button, i) => {
          return (
            <MenuItem key={`detail-button-mobile-${i}`}>
              <Button
                fullWidth
                size="medium"
                variant="text"
                color={button.color}
                onClick={() => button.onClick(mostrarMenu)}
                startIcon={button.icono}
              >
                {t(button.titulo)}
              </Button>
            </MenuItem>
          )
        })}
      </Menu>
    )
  }

  function pintarContenido() {
    return (
      <Grid container spacing={5}>
        <Grid item xs={12} md={8}>
          <ClienteFormulario
            id={id}
            deshabilitado={true}
            cliente={cliente}
            inputLabelProps={inputLabelProps}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Hidden smDown>
            <Grid
              container
              spacing={1}
              direction="column"
              justifyContent="flex-start"
              alignItems="stretch"
            >
              {Array.isArray(botonesPrincipales) &&
                botonesPrincipales.length > 0 &&
                pintarBotonesPrincipales()}
            </Grid>
          </Hidden>
          {botonPrincipalMovil && (
            <Hidden mdUp>
              <Grid
                container
                spacing={1}
                direction="row"
                justifyContent="flex-end"
                alignItems="flex-start"
              >
                <Grid item key={`detail-sub-button-principal-Movile`} xs={6}>
                  <Button
                    fullWidth
                    size="medium"
                    variant={botonPrincipalMovil.variante}
                    color={botonPrincipalMovil.color}
                    onClick={() => botonPrincipalMovil.onClick()}
                    startIcon={botonPrincipalMovil.icono}
                  >
                    {t(botonPrincipalMovil.titulo)}
                  </Button>
                </Grid>
              </Grid>
            </Hidden>
          )}
        </Grid>
      </Grid>
    )
  }

  return (
    <>
      <Dialog
        maxWidth="lg"
        fullWidth
        fullScreen={fullScreen}
        open={mostrar}
        onClose={() => cerrar()}
        aria-labelledby="responsive-dialog-titulo"
      >
        <Hidden mdUp>
          {Array.isArray(botonesMovil) && botonesMovil.length > 0 && pintarBotonesMovil()}
        </Hidden>
        <Hidden mdUp>
          <DialogTitle id="responsive-dialog-titulo" className={classes.dialogTitle}>
            <Grid container direction="row" alignItems="center" spacing={3}>
              <Grid item xs={2}>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  className={classes.iconBtn}
                  onClick={() => {
                    cerrar()
                  }}
                >
                  <IoCloseOutline size={ICON_SIZE} />
                </IconButton>
              </Grid>
              <Grid item xs={8}>
                <Typography className={classes.title}>Detalle {titulo}</Typography>
              </Grid>
              <Grid item xs={2} className={classes.options}>
                <IconButton
                  ref={anchorRef}
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={mostrarMenu}
                  className={classes.iconBtn}
                >
                  <IoEllipsisVertical size={ICON_SIZE} />
                </IconButton>
              </Grid>
            </Grid>
          </DialogTitle>
        </Hidden>
        <Hidden smDown>
          <DialogTitle className={classes.title}>
            <Text text={`Detalle ${titulo}`} />
          </DialogTitle>
        </Hidden>
        <DialogContent>
          <div className={classes.content}>{pintarContenido()}</div>
        </DialogContent>
      </Dialog>
      {modalBorrado && (
        <DialogGeneric
          open={modalBorrado}
          text="¿Deseas eliminar de forma permanente el cliente selecionado?"
          title="Eliminar clientes"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
    </>
  )
}

export default ClienteDetalleModal
