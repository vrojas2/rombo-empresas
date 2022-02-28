import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Theme,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { Plan } from '@rombomx/models'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@material-ui/lab'

const MinCardLength = 40

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  card: {
    margin: theme.spacing(2),
    border: 'solid 2px transparent',
    minWidth: theme.spacing(MinCardLength),
  },
  cardSelected: {
    borderColor: theme.palette.primary.main,
    margin: theme.spacing(2),
    border: 'solid 2px',
    minWidth: theme.spacing(MinCardLength),
  },
  cardHeader: {
    borderBottom: `solid 1px ${theme.palette.divider}`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  cardTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: theme.typography.h5.fontSize,
  },
  cardSubTitle: {
    paddingLeft: theme.spacing(4),
    fontSize: theme.typography.body1.fontSize,
    fontWeight: 'bold',
  },
  cardBullet: {
    display: 'flex',
    marginTop: theme.spacing(2),
  },
  cardBulletIcon: {
    width: theme.spacing(4),
    color: theme.palette.info.main,
    fontWeight: 'bold',
    fontSize: theme.typography.h6.fontSize,
  },
  cardBulletText: {
    margin: 0,
    padding: 0,
    width: '100%',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: theme.spacing(3),
    marginTop: theme.spacing(1),
  },
}))

type Props = {
  plan: Plan
  selected?: boolean
  onSelect: () => void
  loading?: boolean
}

const pesosFormat = Intl.NumberFormat('es-MX', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatIntervaloMensual(intervalo: number) {
  switch (intervalo) {
    case 1:
      return 'mensualmente'
    default:
      return `cada ${intervalo} meses`
  }
}

const PlanCard = ({ loading = true, plan, selected = false, onSelect }: Props): ReactElement => {
  const classes = useStyles()
  const { t } = useTranslation()

  return (
    <Card className={selected ? classes.cardSelected : classes.card}>
      <CardContent className={classes.cardHeader}>
        <div className={classes.cardTitle}>
          {loading ? <Skeleton /> : `${t('Plan')} ${t(plan.nombre)}`}
        </div>
      </CardContent>
      <CardContent>
        <div className={classes.cardSubTitle}>
          {loading ? (
            <Skeleton />
          ) : (
            `Paga $${pesosFormat.format(plan.costo / 100)} ${formatIntervaloMensual(
              plan.intervalo,
            )}.`
          )}
        </div>
      </CardContent>
      {/*
      //Descomentar cuando los planes tengan distintas características
      <CardContent>
        {plan?.detalles?.map((detalle, idx) => (
          <div key={`plan-${plan.id}-${idx}`} className={classes.cardBullet}>
            <div className={classes.cardBulletIcon}>
              <MdCheck />
            </div>
            <Typography className={classes.cardBulletText} variant="body1">
              {loading ? <Skeleton /> : t(detalle)}
            </Typography>
          </div>
        ))}
      </CardContent>
        */}
      <CardActions className={classes.cardActions}>
        {loading && <CircularProgress />}
        {!loading && (
          <Button onClick={onSelect} variant={selected ? 'contained' : 'outlined'} color="primary">
            {t(selected ? 'Seleccionado' : 'Elegir este Plan')}
          </Button>
        )}
      </CardActions>
    </Card>
  )
}

export default PlanCard
