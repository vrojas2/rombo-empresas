import { useEffect, useState, useRef } from 'react'
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
import { isValidArray } from '@rombomx/ui-commons'
import { FacturaEstatus } from '@rombomx/models'
import getConfig from 'next/config'

import FacturaFormulario from './FacturaFormulario'
import { getInformacionFactura } from './'
import { Factura } from '@rombomx/models'
import { useErrorHandler } from '../../providers/errors'
import {
  FacturaRequest,
  BotonesFacturaDetalle,
  BotonesDetalle,
  DetailProps,
  ButtonsDialog,
  SelectOptionsProps,
} from '../../propTypes'
import { deleteItem, request, createItem } from '../../services'
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

const { publicRuntimeConfig } = getConfig()
const { cfdiResource } = publicRuntimeConfig

export const FacturaDetalleModal = ({
  id,
  mostrar,
  titulo,
  cerrar,
  cargarDatos,
}: DetailProps): JSX.Element => {
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
  const [factura, setFactura] = useState<FacturaRequest>(null)
  const [cfdiCatalog, setCFDICatalog] = useState<Array<SelectOptionsProps>>()
  const [modalBorrado, setModalBorrado] = useState<boolean>(false)
  const prevAbrirMenu = useRef(abrirMenu)

  const inputLabelProps = {
    classes: classes.inputLabelProps,
  }

  const eliminarFactura = () => {
    loading(t('eliminando factura').toString())
    deleteItem<Factura>('facturas', `${id}`)
      .then((res) => {
        cargarDatos()
        cerrar()
        successMessage('Factura eliminada exitosamente')
      })
      .catch((e) => {
        handleError(t('error al eliminar el factura'), null, e)
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
      onClick: eliminarFactura,
      color: 'primary',
    },
  ]

  const imprimirPDF = async () => {
    try {
      console.log('imprimir', factura)
      if (factura.estatus !== FacturaEstatus.TIMBRADO) {
        loading(t('generando pdf...').toString())
        // generacion de PDF para facturas no certificadsa
        // await request('GET', '', '')
      }
      loading(t('descargando pdf...').toString())
      const fileUrl: { url: string } = await request<{ url: string }>(
        'GET',
        'facturas',
        `${id}/pdf`,
      )
      window.open(fileUrl.url, '_blank')
    } catch (e) {
      handleError(t('Error al traer el archivo').toString(), e.message)
    } finally {
      loading(false)
    }
  }

  const verXml = async () => {
    try {
      loading(t('descargando xml...').toString())
      const fileUrl: { url: string } = await request<{ url: string }>(
        'GET',
        'facturas',
        `${id}/xml`,
      )
      window.open(fileUrl.url, '_blank')
    } catch (e) {
      handleError(t('Error al traer el archivo').toString(), e.message)
    } finally {
      loading(false)
    }
  }

  const certificarFactura = async () => {
    try {
      loading(t('certificando factura').toString())
      await createItem({ facturaId: id }, cfdiResource, 'v33', true)
      await request('POST', 'facturas', `${id}/certify`)
      await cargarDatos()
      cerrar()
    } catch (e) {
      handleError(t('Error al certificar factura').toString(), e.message)
    } finally {
      loading(false)
    }
  }

  const botonesFacturaCertificada: BotonesFacturaDetalle = {
    principales: [
      {
        titulo: 'Ver PDF',
        color: 'primary',
        onClick: imprimirPDF,
        // icono: <IoTrashOutline size="1em" />,
      },
      {
        titulo: 'Ver XML',
        color: 'secondary',
        onClick: verXml,
        // icono: <IoTrashOutline size="1em" />,
      },
      {
        titulo: 'Salir',
        onClick: cerrar,
        color: 'default',
        variante: 'outlined',
      },
    ],
    secundarios: [
      {
        titulo: 'Imprimir',
        color: 'primary',
        onClick: imprimirPDF,
        // icono: <IoPencilOutline size="1em" />,
      },
      {
        titulo: 'Enviar por correo',
        color: 'primary',
        onClick: () => {
          return null
        },
        // icono: <IoTrashOutline size="1em" />,
      },
      {
        titulo: 'Cancelar factura',
        color: 'primary',
        variante: 'outlined',
        onClick: () => setModalBorrado(true),
        // icono: <IoTrashOutline size="1em" />,
      },
    ],
  }

  const botonesFacturaPendiente: BotonesFacturaDetalle = {
    principales: [
      {
        titulo: 'Editar datos',
        color: 'primary',
        onClick: (fn) => {
          if (fn) fn()
          router.push(`facturas/${id}`)
        },
        principal: true,
        icono: <IoPencilOutline size="1em" />,
      },
      {
        titulo: 'Certificar factura',
        color: 'secondary',
        onClick: certificarFactura,
        // icono: <IoTrashOutline size="1em" />,
      },
      {
        titulo: 'Salir',
        onClick: cerrar,
        color: 'default',
        variante: 'outlined',
      },
    ],
    secundarios: [
      {
        titulo: 'Cancelar factura',
        color: 'primary',
        onClick: () => {
          return null
        },
        icono: <IoPencilOutline size="1em" />,
      },
      {
        titulo: 'Eliminar factura',
        color: 'primary',
        onClick: () => setModalBorrado(true),
        // icono: <IoTrashOutline size="1em" />,
      },
    ],
  }

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
    loadFacturaInfo()
  }, [])

  useEffect(() => {
    let botonesPrincipales = botonesFacturaPendiente.principales.concat(
      botonesFacturaCertificada.secundarios,
    )

    if (factura && factura.estatus === FacturaEstatus.TIMBRADO) {
      botonesPrincipales = botonesFacturaCertificada.principales.concat(
        botonesFacturaCertificada.secundarios,
      )
    }

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
    let botonesPrincipales = botonesFacturaPendiente.principales

    if (factura && factura.estatus === FacturaEstatus.TIMBRADO) {
      botonesPrincipales = botonesFacturaCertificada.principales
    }

    if (!isValidArray(botonesPrincipales)) {
      return
    }

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

  function pintarBotonesSecundarios(): Array<JSX.Element> {
    let botonesSecundarios = botonesFacturaPendiente.secundarios

    if (factura && factura.estatus === FacturaEstatus.TIMBRADO) {
      botonesSecundarios = botonesFacturaCertificada.secundarios
    }

    if (!isValidArray(botonesSecundarios)) {
      return
    }

    return botonesSecundarios.map((button, i) => {
      return (
        <Grid item key={`detail-mains-button-${i}`} xs={8}>
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
          <FacturaFormulario
            id={id}
            deshabilitado={true}
            factura={factura}
            cfdiCatalog={cfdiCatalog}
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
              {pintarBotonesPrincipales()}
            </Grid>
            <Grid xs={12}>
              <hr />
            </Grid>
            <Grid
              container
              spacing={1}
              direction="column"
              justifyContent="flex-start"
              alignItems="center"
            >
              {pintarBotonesSecundarios()}
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
          text="¿Deseas eliminar de forma permanente la factura selecionada?"
          title="Eliminar facturas"
          buttons={botonesBorrar}
          handleClose={cerrarBorrado}
          actions
        />
      )}
    </>
  )
}

export default FacturaDetalleModal
