import { useState, useEffect } from 'react'
import { Plan, Empresa as EmpresaInfo } from '@rombomx/models'
import { Grid, Card, CardContent, Button, Paper, Container } from '@material-ui/core'

import { Planes } from '../../lib/components/configuracion/PlanesFormulario'
import { Administrador } from '../../lib/components/configuracion/AdminFormulario'
import { Empresa } from '../../lib/components/configuracion/EmpresaFormulario'
import { Page } from '../../lib/layout/main'
import { getEntityRecord } from '../../lib/services'

export const EmpresaPage = (): JSX.Element => {
  const [plan, setPlan] = useState<boolean>(true)
  const [administrador, setAdministrador] = useState<boolean>(false)
  const [empresa, setEmpresa] = useState<boolean>(false)
  const [planes, setPlanes] = useState(null)
  const [info, setInfo] = useState(null)

  const loadPlanes = async () => {
    getEntityRecord<Plan>('subscripciones', `planes`)
      .then((data) => {
        setPlanes(data)
      })
      .catch((e) => {
        console.error('error', e)
        setPlanes(null)
      })
  }

  const loadInfo = async () => {
    getEntityRecord<EmpresaInfo>('empresas', `info`)
      .then((data) => {
        setInfo(data)
      })
      .catch((e) => {
        console.error('error', e)
        setInfo(null)
      })
  }

  function SetShow(value: string) {
    setPlan(value === 'plan' ? true : false)
    setAdministrador(value === 'admin' ? true : false)
    setEmpresa(value === 'empresa' ? true : false)
  }

  useEffect(() => {
    loadPlanes()
    loadInfo()
  }, [])

  console.log(info)

  return (
    <Page title="Empresa">
      <Container>
        <Administrador />
        <Empresa />
      </Container>
    </Page>
  )
}

export default EmpresaPage
