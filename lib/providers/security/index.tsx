import {
  useContext,
  createContext,
  PropsWithChildren,
  ReactElement,
  useState,
  useEffect,
} from 'react'
import { Auth } from 'aws-amplify'
import Head from 'next/head'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { AmplifyAuthenticator, AmplifySignIn } from '@aws-amplify/ui-react'
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components'
import packageConfig from '../../../package.json'

export type SecurityContextProps = {
  getCurrentUser: () => Promise<CognitoUser>
  signOut: () => Promise<void>
  getUserRoles: () => Promise<Array<string>>
  getEmpresaId: () => Promise<number>
}

export const SecurityContext = createContext<SecurityContextProps>(null)

export const useSecurity = (): SecurityContextProps => useContext(SecurityContext)

export const SecurityProvider = ({ children }: PropsWithChildren<any>): ReactElement => {
  const [authState, setAuthState] = useState<AuthState>()

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState) => {
      setAuthState(nextAuthState)
    })
  }, [])

  if (authState === AuthState.SignedIn) {
    return (
      <SecurityContext.Provider
        value={{
          getCurrentUser() {
            return Auth.currentAuthenticatedUser()
          },
          async signOut() {
            await Auth.signOut()
            setAuthState(AuthState.SignOut)
          },
          async getUserRoles() {
            const user = (await Auth.currentAuthenticatedUser()) as CognitoUser
            return user?.getSignInUserSession()?.getIdToken()?.payload?.['custom:permissions'] || []
          },
          async getEmpresaId(): Promise<number> {
            const user = (await Auth.currentAuthenticatedUser()) as CognitoUser
            const id = user?.getSignInUserSession()?.getIdToken()?.payload?.['custom:empresa']
            try {
              return parseInt(id)
            } catch (e) {
              //TODO: implent error handler
              console.error('Error obteniendo empresa id', e)
            }
          },
        }}
      >
        {children}
      </SecurityContext.Provider>
    )
  } else {
    return (
      <>
        <Head>
          <title>Rombo</title>
        </Head>
        {/*<LoginForm />*/}
        <AmplifyAuthenticator translate="yes">
          <AmplifySignIn
            slot="sign-in"
            headerText={`Bienvenido a Rombo v${packageConfig.version}`}
            translate="yes"
            hideSignUp
            // ={
            //   <>
            //     <Text text="Si no tienes cuenta da clic " />
            //     <Link href="/public/registro">
            //       <Text text="aquí" />
            //     </Link>
            //   </>
            // }
          ></AmplifySignIn>
        </AmplifyAuthenticator>
      </>
    )
  }
}
