import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import NextLink from 'next/link'
import getConfig from 'next/config'
import { Alert, Color } from '@material-ui/lab'
import { logger } from '@rombomx/ui-commons'
import {
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { MdClose } from 'react-icons/md'
import { execute, request } from '../../services'
import { formatDate } from '../../helpers'
import { useTranslation } from 'react-i18next'
import { useFeedback } from '../feedback'
import { useErrorHandler } from '../errors'

const STRIPE_STATUS_UNDEFINED = 'undefined'
const STRIPE_STATUS_ACTIVE = 'active'
const STRIPE_STATUS_TRIALING = 'trialing'
const STRIPE_STATUS_CANCELED = 'canceled'
const STRIPE_STATUS_INCOMPLETE = 'incomplete'
const STRIPE_STATUS_ERROR = 'error'

type SubscriptionStatus = {
  inicio: number
  fin: number
  periodo: {
    inicio: number
    fin: number
  }
  trial: {
    inicio?: number
    fin?: number
  }
  status: string
}

type Subscripcion = {
  metodoDePago?: any
  plan?: { id: string; nombre: string }
  subscripcion: SubscriptionStatus
}

const {
  publicRuntimeConfig: { contactEmail },
} = getConfig()

const useClasses = makeStyles((theme: Theme) => ({
  message: {
    marginBottom: theme.spacing(2),
  },
  messageLink: {
    fontWeight: 'bold',
    color: theme.palette.grey[900],
  },
}))

const Message = ({
  children,
  severity,
  open,
  onClose,
}: PropsWithChildren<{ severity: Color; open: boolean; onClose?: () => void }>) => {
  const classes = useClasses()
  return (
    <Collapse in={open}>
      <Paper className={classes.message} elevation={4}>
        <Alert
          action={
            onClose ? (
              <IconButton aria-label="close" color="inherit" size="small" onClick={onClose}>
                <MdClose fontSize="inherit" />
              </IconButton>
            ) : undefined
          }
          severity={severity}
        >
          {children}
        </Alert>
      </Paper>
    </Collapse>
  )
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type SubscriptionsContextProps = {
  loadSubscription: (full: boolean) => Promise<Subscripcion>
}

export const SubscriptionsContext = createContext<SubscriptionsContextProps>(null)

export const useSubscription = (): SubscriptionsContextProps => useContext(SubscriptionsContext)

export const SubscriptionsProvider = ({ children }: PropsWithChildren<any>): JSX.Element => {
  const [subscription, setSubscription] = useState<SubscriptionStatus>()
  const [showMessage, setShowMessage] = useState<boolean>(true)
  const { loading, isLoading } = useFeedback()
  const { t } = useTranslation()
  const classes = useClasses()
  const { handleError } = useErrorHandler()

  //TODO: quitar status de ERROR para que no se despliegue nada cuando haya error
  const isDisponible = () =>
    [
      STRIPE_STATUS_ACTIVE,
      STRIPE_STATUS_INCOMPLETE,
      STRIPE_STATUS_TRIALING,
      STRIPE_STATUS_ERROR,
    ].includes(subscription.status)

  const loadSubscription = async (full = false) => {
    try {
      logger.debug('Cargando subscripción')

      const subscripcion = await request<Subscripcion>(
        'GET',
        'subscripciones',
        `actual${full ? '?full=true' : ''}`,
      )
      logger.debug('subscripción', subscripcion)
      setSubscription(subscripcion.subscripcion)

      return subscripcion
    } catch (e) {
      handleError('Error cargando datos de subscripción', e.description || e.message || '', e)
      const subscripcionConError: Subscripcion = {
        subscripcion: {
          fin: 0,
          inicio: 0,
          periodo: {
            fin: 0,
            inicio: 0,
          },
          trial: {},
          status: STRIPE_STATUS_ERROR,
        },
      }
      setSubscription(subscripcionConError.subscripcion)
      return subscripcionConError
    }
  }

  const redirectToPaymentLink = async () => {
    loading('Redirigiendo a página de pago')
    const { url } = await execute<{ url: string }>('subscripciones', '_crear-payment-method-link', {
      source: window.document.URL,
    })

    window.location.href = url
  }

  const closeMessage = () => {
    setShowMessage(false)
  }
  useEffect(() => {
    loadSubscription()
  }, [])

  function render() {
    switch (subscription?.status) {
      case STRIPE_STATUS_UNDEFINED:
      case STRIPE_STATUS_ERROR:
        return (
          <Message open severity="error">
            <strong>Atención Developers!</strong> La subscripción no se encuentra correctamente
            configurada. Es necesario volver a crear la cuenta
          </Message>
        )
      case STRIPE_STATUS_TRIALING:
        return (
          <Message open={showMessage} severity="info" onClose={closeMessage}>
            {subscription.trial?.fin && (
              <>
                Tu periodo de prueba terminará el{' '}
                <strong>{formatDate(subscription.trial?.fin)}</strong>
              </>
            )}
            {!subscription.trial?.fin && t('Te encuentras en periodo de prueba')}
          </Message>
        )

      case STRIPE_STATUS_INCOMPLETE:
        return (
          <Message open={showMessage} severity="warning">
            <strong>{t('No hemos podido procesar tu pago.')}</strong>{' '}
            {t(' Por favor revisa tus datos de pago')}{' '}
            <NextLink href={'/configuracion/subscripcion'} passHref>
              <Link underline="always" className={classes.messageLink}>
                {t('aquí')}
              </Link>
            </NextLink>
            .
          </Message>
        )
      default:
        return null
    }
  }

  if (!subscription)
    return (
      <Container>
        <Typography>{t('Cargando...')}</Typography>
      </Container>
    )

  if (isDisponible()) {
    return (
      <SubscriptionsContext.Provider
        value={{
          loadSubscription,
        }}
      >
        <>
          {render()}
          {children}
        </>
      </SubscriptionsContext.Provider>
    )
  }

  //TODO: modificar para mostrar pantalla de error
  if (subscription.status === STRIPE_STATUS_ERROR + 1) {
    return (
      <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
        <Grid item xs={12}>
          <Box mt={5} mb={3}>
            <img src="/logo.png" alt="rombo" />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography color="secondary" variant="h4">
            Error de configuración
            <Divider />
          </Typography>
        </Grid>
        <br />
        <br />
        <Grid item xs={12}>
          <Typography color="textPrimary" variant="h6">
            {t('Por favor comunicate a ')}{' '}
            <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
          </Typography>
        </Grid>
      </Grid>
    )
  }

  if (subscription.status === STRIPE_STATUS_CANCELED) {
    return (
      <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
        <Grid item xs={12}>
          <Box mt={5} mb={3}>
            <img src="/logo.png" alt="rombo" />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Typography color="secondary" variant="h4">
            Esta cuenta se encuentra cancelada.
            <Divider />
          </Typography>
        </Grid>
        <br />
        <br />
        <Grid item xs={12}>
          <Typography color="textPrimary" variant="h6">
            {t('Si deseas reactivar tu cuenta comunicate a ')}{' '}
            <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
          </Typography>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center">
      <Grid item xs={12}>
        <Box mt={5} mb={3}>
          <img src="/logo.png" alt="rombo" />
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h4">
          {t('Esta cuenta se encuentra suspendida.')}
          <Divider />
        </Typography>
      </Grid>
      <br />
      <br />
      <Grid item xs={12}>
        <Typography color="textPrimary" variant="h6">
          <Button onClick={redirectToPaymentLink} color="primary" disabled={isLoading()}>
            {t('Actualiza tu medio de pago')}
          </Button>
        </Typography>
      </Grid>
    </Grid>
  )
}
