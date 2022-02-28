import { createContext, PropsWithChildren, useContext } from 'react'
import { useFeedback } from '../feedback'

export type ErrorContextProps = {
  handleError: (title: string, message: string, cause?: Error | any) => void
}

export const ErrorContext = createContext<ErrorContextProps>(null)

export const useErrorHandler = (): ErrorContextProps => useContext(ErrorContext)

export const ErrorHandlerProvider = ({ children }: PropsWithChildren<any>): JSX.Element => {
  const { errorMessage } = useFeedback()
  return (
    <ErrorContext.Provider
      value={{
        handleError(title: string, message: string, cause?: Error | any) {
          if (cause) console.error(cause)
          errorMessage(message, title)
        },
      }}
    >
      {children}
    </ErrorContext.Provider>
  )
}
