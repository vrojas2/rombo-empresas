import { ReactElement,  } from 'react'
import { RegistrationProvider } from '../../../lib/components/registration/RegistrationContext'
import RegistrationPage from '../../../lib/components/registration/RegistrationPage'

const RegistroIndexPage = (): ReactElement => {
  return (
    <RegistrationProvider>
      <RegistrationPage />      
    </RegistrationProvider>
  )
}

export default RegistroIndexPage
