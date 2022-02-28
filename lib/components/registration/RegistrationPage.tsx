import { Button, Container, Hidden, makeStyles, Theme, Typography } from '@material-ui/core'
import { ReactElement, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SwipeableViews from 'react-swipeable-views'
import PublicPage from '../../layout/main/PublicPage'
import AdministrationForm from './AdministratorForm'
import EmpresaForm from './EmpresaForm'
import Paso from './Paso'
import PlanForm from './PlanForm'
import { RegistrationStates, useRegistrationForm } from './RegistrationContext'
import RegistroTerminado from './RegistroTerminado'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    maxWidth: '96vw',
  },
  titulo: {
    width: '100%',
    fontWeight: 'bold',
    borderBottom: '1px solid',
    paddingBottom: theme.spacing(2),
    fontSize: theme.typography.h3.fontSize,
    marginBottom: theme.spacing(2),
  },
  swipeable: {
    minHeight: theme.spacing(47),
  },
  lineas: {
    height: theme.spacing(8),
  },
  linea: {
    fontWeight: 'bold',
    fontSize: theme.typography.body2.fontSize,
  },
  descripcion: {
    marginBottom: theme.spacing(2),
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  siguiente: {
    width: theme.spacing(24),
  },
}))

const RegistrationPage = (): ReactElement => {
  const { t } = useTranslation()
  const classes = useStyles()
  const { currentStep, next, back, isNextEnabled, getSwipableState } = useRegistrationForm()

  const textos = useMemo(
    () => [
      {
        button: t('Siguiente'),
        subtitulo: t('¡En sólo tres pasos estará todo listo!'),
        lineas: [
          t('Elige un plan para comenzar a usar Rombo.'),
          t('En los planes de pago tendrás un periodo de N días de prueba sin costo.'),
        ],
      },
      {
        button: t('Siguiente'),
        subtitulo: t('¡Casi terminamos!'),
        lineas: [t('Agrega los datos del Administrador de la empresa.')],
      },
      {
        button: t('Finaliza Registro'),
        subtitulo: t('Ingresa los datos de la empresa'),
        lineas: [],
      },
    ],
    [],
  )

  return (
    <PublicPage title="Registro">
      <Container className={classes.root}>
        <Typography className={classes.titulo} variant="h1">
          ROMBO
        </Typography>
        {currentStep === RegistrationStates.REGISTERED && <RegistroTerminado />}
        {currentStep < RegistrationStates.REGISTERED && (
          <>
            <Paso />
            <Typography className={classes.descripcion}>
              {textos[getSwipableState()].subtitulo}
            </Typography>
            <div className={classes.lineas}>
              {textos[getSwipableState()].lineas.map((linea, idx) => (
                <Typography key={`planes-display-linea-${idx}`} className={classes.linea}>
                  {linea}
                </Typography>
              ))}
            </div>
            <Hidden mdUp>
              <div className={classes.actions}>
                {currentStep > RegistrationStates.VIEW_PLAN_SELECT && (
                  <>
                    <Button
                      onClick={back}
                      className={classes.siguiente}
                      disabled={currentStep === RegistrationStates.PROCESSING_REGISTER}
                    >
                      {t('Anterior')}
                    </Button>
                    <Button
                      onClick={next}
                      color="primary"
                      className={classes.siguiente}
                      disabled={!isNextEnabled()}
                    >
                      {textos[getSwipableState()].button}
                    </Button>
                  </>
                )}
              </div>
            </Hidden>
            <SwipeableViews index={getSwipableState()} className={classes.swipeable}>
              <PlanForm />
              <AdministrationForm />
              <EmpresaForm />
            </SwipeableViews>
            <Hidden smDown>
              <div className={classes.actions}>
                {currentStep > RegistrationStates.VIEW_PLAN_SELECT ? (
                  <Button
                    onClick={back}
                    className={classes.siguiente}
                    disabled={currentStep === RegistrationStates.PROCESSING_REGISTER}
                  >
                    {t('Anterior')}
                  </Button>
                ) : (
                  <div />
                )}

                <Button
                  onClick={next}
                  color="primary"
                  className={classes.siguiente}
                  disabled={!isNextEnabled()}
                >
                  {textos[getSwipableState()].button}
                </Button>
              </div>
            </Hidden>
          </>
        )}
      </Container>

      {/*
      <Container>
        

        

        

        
      </Container>
          */}
    </PublicPage>
  )
}

export default RegistrationPage
