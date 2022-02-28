import { Container, Grid, Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import { Plan } from '@rombomx/models'
import { ReactElement, useState } from 'react'
import PlanCard from './PlanCard'

const SkeletonPlan: Plan = {
  id: '',
  //detalles: ['', '', ''],
  nombre: '',
  //orden: 1,
  costo: 0,
  tipoIntervalo: '',
  intervalo: 0,
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
  },
}))

type Props = {
  planes: Array<Plan>
  onSelect: (planId: string) => void
  loading: boolean
}

const PlanesDisplay = ({ planes, onSelect, loading = false }: Props): ReactElement => {
  const classes = useStyles()
  const [selectedPlan, setSelectedPlan] = useState<string>()

  const onSelectPlan = (plan: Plan) => () => {
    setSelectedPlan(plan.id)
    onSelect(plan.id)
  }

  return (
    <Grid container justifyContent="center">
      {(loading ? [SkeletonPlan, SkeletonPlan, SkeletonPlan] : planes).map((plan, idx) => (
        <Grid key={`plan-card-${plan.id}-${idx}`}>
          <PlanCard
            plan={plan}
            selected={plan.id === selectedPlan}
            onSelect={onSelectPlan(plan)}
            loading={loading}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default PlanesDisplay
