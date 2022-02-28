import { Plan } from '@rombomx/models'
import { ReactElement, useEffect, useState } from 'react'
import { useErrorHandler } from '../../providers/errors'
import { request } from '../../services'
import PlanesDisplay from '../planes/PlanesDisplay'
import { RegistrationStates, useRegistrationForm } from './RegistrationContext'

const PlanForm = (): ReactElement => {
  const [planes, setPlanes] = useState<Array<Plan>>([])
  const { handleError } = useErrorHandler()
  const [loading, setLoading] = useState<boolean>(false)
  const { setPlanId, setCurrentStep } = useRegistrationForm()

  const onSelectPlan = (planId: string) => {
    setPlanId(planId)
    setCurrentStep(RegistrationStates.VIEW_ADMIN_FORM)
  }

  useEffect(() => {
    setLoading(true)
    request<Array<Plan>>('GET', 'subscripciones', 'planes', true)
      .then(setPlanes)
      .catch((e) => handleError('Error cargando planes', '', e))
      .finally(() => setLoading(false))
  }, [])
  return <PlanesDisplay planes={planes} onSelect={onSelectPlan} loading={loading} />
}

export default PlanForm
