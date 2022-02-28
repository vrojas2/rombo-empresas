import { createContext, PropsWithChildren, ReactElement, useContext, useState } from 'react'
import axios from 'axios'
import getConfig from 'next/config'
import { AdministradorFormDTO, EmpresaFormDTO } from './models'
import RegistroModal from './RegistroModal'
import { useErrorHandler } from '../../providers/errors'
import { useTranslation } from 'react-i18next'

export const RegistrationStates = {
  VIEW_PLAN_SELECT: 1,
  VIEW_ADMIN_FORM: 2,
  VALIDATE_ADMIN_FORM: 3,
  VIEW_EMPRESA_FORM: 4,
  VALIDATE_EMPRESA_FORM: 5,
  PROCESSING_REGISTER: 6,
  REGISTERED: 7,
}

const {
  VALIDATE_ADMIN_FORM,
  VALIDATE_EMPRESA_FORM,
  VIEW_ADMIN_FORM,
  VIEW_EMPRESA_FORM,
  VIEW_PLAN_SELECT,
  PROCESSING_REGISTER,
  REGISTERED,
} = RegistrationStates

const {
  publicRuntimeConfig: { baseUrl },
} = getConfig()

type RegistrationContextProps = {
  next: () => void
  back: () => void
  setCurrentStep: (step: number) => void
  isNextEnabled: () => boolean
  currentStep: number
  setPlanId: (planId: string) => void
  setAdmin: (admin: AdministradorFormDTO) => void
  setEmpresa: (empresa: EmpresaFormDTO) => void
  getSwipableState: () => number
  isRegistering: boolean
  doRegister: () => Promise<void>
}

export const RegistrationContext = createContext<RegistrationContextProps>(null)

export const useRegistrationForm = (): RegistrationContextProps => useContext(RegistrationContext)

export const RegistrationProvider = ({ children }: PropsWithChildren<any>): ReactElement => {
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState<number>(RegistrationStates.VIEW_PLAN_SELECT)
  const [planId, setPlanId] = useState<string>()
  const [admin, setAdmin] = useState<AdministradorFormDTO>()
  const [empresa, setEmpresa] = useState<EmpresaFormDTO>()
  const [isRegistering, setIsRegistering] = useState<boolean>(false)

  const next = (validationFunction?: () => boolean) => {
    if (typeof validationFunction === 'function') validationFunction()

    switch (currentStep) {
      case VIEW_PLAN_SELECT:
        setCurrentStep(VIEW_ADMIN_FORM)
        break
      case VIEW_ADMIN_FORM:
        setCurrentStep(VALIDATE_ADMIN_FORM)
        break
      case VALIDATE_ADMIN_FORM:
        setCurrentStep(VIEW_EMPRESA_FORM)
        break
      case VIEW_EMPRESA_FORM:
        setCurrentStep(VALIDATE_EMPRESA_FORM)
        break
    }
  }

  const back = () => {
    switch (currentStep) {
      case VIEW_PLAN_SELECT:
        return
      case VIEW_ADMIN_FORM:
      case VALIDATE_ADMIN_FORM:
        setCurrentStep(VIEW_PLAN_SELECT)
        break
      case VIEW_EMPRESA_FORM:
      case VALIDATE_EMPRESA_FORM:
        setCurrentStep(VIEW_ADMIN_FORM)
        break
    }
  }

  const isNextEnabled = () => {
    switch (currentStep) {
      case VIEW_PLAN_SELECT:
        return !!planId
      case VIEW_ADMIN_FORM:
        return true
      case VIEW_EMPRESA_FORM:
        return true
      default:
        return false
    }
  }

  const getSwipableState = () => {
    switch (currentStep) {
      case VIEW_PLAN_SELECT:
        return 0
      case VIEW_ADMIN_FORM:
      case VALIDATE_ADMIN_FORM:
        return 1
      case VIEW_EMPRESA_FORM:
      case VALIDATE_EMPRESA_FORM:
      case PROCESSING_REGISTER:
        return 2
      default:
        return 0
    }
  }

  const doRegister = async () => {
    setIsRegistering(true)
    try {
      console.log('Registering', empresa, admin, planId)
      const { data, status } = await axios.post(`https://subscripciones.${baseUrl}`, {
        nombreCliente: admin.nombre,
        correoCliente: admin.correo,
        numeroTelefonico: admin.numeroTelefonico,
        nombreEmpresa: empresa.nombre,
        contrasena: admin.contrasena,
        giroComercialId: empresa.giroComercialId,
        giroComercial: empresa.nombreGiroComercial,
        planId: planId,
      })
      setCurrentStep(REGISTERED)
    } catch (e) {
      const erroMsg = t('Hubo un error en el registro')
      const { data = {}, status } = e.response || {}
      if (status >= 400 && status < 500) {
        const { title } = data
        switch (title) {
          case 'usuario existente':
            handleError(erroMsg, t('El correo electrónico ya se encuentra registrado.'))
            setCurrentStep(VIEW_ADMIN_FORM)
            break
          default:
            handleError(erroMsg, t('Existe un error en sus datos. Verifique la información.'))
            setCurrentStep(VIEW_ADMIN_FORM)
            break
        }
      } else {
        handleError(erroMsg, t('Intente más tarde.'))
        setCurrentStep(VIEW_ADMIN_FORM)
      }
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <RegistrationContext.Provider
      value={{
        currentStep,
        next,
        back,
        setPlanId,
        isNextEnabled,
        getSwipableState,
        setCurrentStep,
        setAdmin,
        setEmpresa,
        isRegistering,
        doRegister,
      }}
    >
      <RegistroModal />
      {children}
    </RegistrationContext.Provider>
  )
}
