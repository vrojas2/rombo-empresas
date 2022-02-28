import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  makeStyles,
  Modal,
  Paper,
  Snackbar,
  Theme,
  Typography,
} from '@material-ui/core'
import getConfig from 'next/config'
import { logger } from '@rombomx/ui-commons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoCard, IoPencil } from 'react-icons/io5'
import { SiAmericanexpress, SiVisa, SiMastercard } from 'react-icons/si'
import { Page } from '../../lib/layout/main'
import { execute, getEntityRecord, request } from '../../lib/services'
import { useRouter } from 'next/router'
import { useFeedback } from '../../lib/providers/feedback'
import { useErrorHandler } from '../../lib/providers/errors'
import { formatDate } from '../../lib/helpers'
import { Alert, AlertProps, Color, Skeleton } from '@material-ui/lab'
import PlanesDisplay from '../../lib/components/planes/PlanesDisplay'
import { Plan } from '@rombomx/models'

const {
  publicRuntimeConfig: { stripeKey },
} = getConfig()

console.log(stripeKey)

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
  },
  plan: {
    fontSize: theme.typography.h4.fontSize,
  },
  card: {
    height: theme.spacing(22),
  },
  creditCard: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.palette.grey[500],
    paddingRight: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

const SubcripcionPage = (): JSX.Element => {
  const [subscripcion, setSubscripcion] = useState<any>()
  const [planes, setPlanes] = useState<Array<Plan>>([])
  const [selectedPlan, setSelectedPlanes] = useState<string>()
  const [showPlanes, setShowPlanes] = useState<boolean>(false)
  const [mensaje, setMensaje] = useState<{ texto: string; severidad: Color; abierto: boolean }>()
  const classes = useStyles()
  const { handleError } = useErrorHandler()
  const router = useRouter()
  const { loading, isLoading, successMessage } = useFeedback()
  const { t } = useTranslation()

  const loadPlanes = async () => {
    try {
      logger.debug('Cargando planes')
      const _planes = await request<Array<Plan>>('GET', 'subscripciones', 'planes', true)
      setPlanes(_planes)
    } catch (e) {
      handleError('Error cargando planes', '', e)
    }
  }

  const loadSubscripcion = async () => {
    try {
      loading('Cargando subscripción')
      logger.debug('Cargando subscripciones')
      const _subscripcion = await getEntityRecord('subscripciones', 'actual?full=true')
      logger.debug('subscripcion', _subscripcion)
      setSubscripcion(_subscripcion as any)
    } catch (e) {
      handleError('Error cargando detalles de subscripción', '', e)
    } finally {
      loading(false)
    }
  }

  const redirectToPaymentLink = async () => {
    loading('Redirigiendo a página de pago')
    const { url } = await execute<{ url: string }>('subscripciones', '_crear-payment-method-link', {
      source: window.document.URL,
    })

    window.location.href = url
  }

  const closeMensaje = () => {
    setMensaje({ ...mensaje, abierto: false })
    router.replace('/configuracion/subscripcion/', undefined, { shallow: true })
  }

  const handleClickSeleccionaPlan = () => {
    setShowPlanes(true)
  }

  const handleClickModificarPlan = async () => {
    loading(t('modificando subscripción').toString())
    try {
      await request('POST', 'subscripciones', 'actual/plan', { plan: selectedPlan })
      setShowPlanes(false)
      successMessage(t('El plan fué modificado.'))
      loadSubscripcion()
    } catch (e) {
      handleError('Error modificando el plan', e.message || e.description || '', e)
    } finally {
      loading(false)
    }
  }

  const handleSelectPlan = (plan) => {
    console.log('plan', plan)
    setSelectedPlanes(plan)
  }

  useEffect(() => {
    loadSubscripcion()
    loadPlanes()
    setTimeout(() => {
      const r = new URLSearchParams(window.location.search).get('r')
      if (r === 'success') {
        console.log('Entro')
        setMensaje({
          abierto: true,
          severidad: 'success',
          texto: t('Tu método de pago fue registrado correctamente'),
        })
      } else if (r === 'cancel') {
        setMensaje({
          abierto: true,
          severidad: 'warning',
          texto: t('No se registró ningún método de pago'),
        })
      }
    }, 1000)
  }, [])

  function texto(val, raw = false) {
    return isLoading() ? <Skeleton width={100} /> : raw ? val : t(val)
  }

  function fecha(val?: number, prefix = '') {
    return isLoading() ? <Skeleton width={100} /> : `${prefix}${formatDate(val)}`
  }

  function iconoTarjeta() {
    if (isLoading()) return <Skeleton width={80} />
    switch (subscripcion?.metodoDePago?.tarjeta?.marca) {
      case 'visa':
        return <SiVisa />
      case 'mastercard':
        return <SiMastercard />
      case 'amex':
        return <SiAmericanexpress />
      default:
        return <IoCard />
    }
  }

  return (
    <Page title={t('Subscripción')}>
      <Snackbar
        open={mensaje?.abierto}
        autoHideDuration={6000}
        onClose={closeMensaje}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <Alert onClose={closeMensaje} severity={mensaje?.severidad}>
          {mensaje?.texto}
        </Alert>
      </Snackbar>
      <Dialog open={showPlanes} fullWidth maxWidth="xl">
        <DialogContent>
          <PlanesDisplay planes={planes} loading={isLoading()} onSelect={handleSelectPlan} />
          <DialogActions>
            <Button
              color="primary"
              size="large"
              disabled={!selectedPlan}
              onClick={handleClickModificarPlan}
            >
              {t('Aceptar')}
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Container>
        <Grid container spacing={2}>
          <Grid item md={12} lg={6}>
            <Card className={classes.card}>
              <CardContent>
                <Grid container>
                  <Grid item xs={11}>
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography className={classes.title}>{t('Plan actual')}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography className={classes.plan}>
                          {texto(subscripcion?.plan?.nombre)}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Typography>
                          {fecha(
                            subscripcion?.subscripcion?.periodo?.fin,
                            `${t('Próximo cobro')}: `,
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color="primary" onClick={handleClickSeleccionaPlan}>
                      <IoPencil />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item md={12} lg={6}>
            <Card className={classes.card}>
              <CardContent>
                <Grid container>
                  <Grid item xs={11}>
                    <Grid container>
                      <Grid item xs={12}>
                        <Typography className={classes.title}>{t('Método de pago')}</Typography>
                      </Grid>
                      <Grid item className={classes.creditCard}>
                        {iconoTarjeta()}
                      </Grid>
                      <Grid item>
                        <Typography>
                          {texto(subscripcion?.metodoDePago?.tarjeta?.numero)}
                        </Typography>
                        <Typography>{texto(subscripcion?.metodoDePago?.nombre)}</Typography>
                        <Typography>
                          {texto(
                            `${t('Fecha de expiración')}: ${
                              subscripcion?.metodoDePago?.tarjeta?.expiracion
                            }`,
                            true,
                          )}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton color="primary" onClick={redirectToPaymentLink}>
                      <IoPencil />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  )
}

export default SubcripcionPage
