import '../lib/config'

import * as React from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import '@fontsource/roboto'
import 'modern-normalize'
import '../styles/main.scss'

import { SecurityProvider } from '../lib/providers/security'
import { MainLayout } from '../lib/layout/main'
import { FeedbackProvider } from '../lib/providers/feedback'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import theme from '../lib/config/theme'
import { ErrorHandlerProvider } from '../lib/providers/errors'
import { ServerMessagesProvider } from '../lib/providers/server-messages'
import { PublicLayout } from '../lib/layout/main/public-layout'

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  console.log('props....', pageProps)
  const router = useRouter()
  console.log('path', router.pathname)
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FeedbackProvider>
          <ErrorHandlerProvider>
            <div>
              {router.pathname.indexOf('/public') === 0 ? (
                <PublicLayout>
                  <Component {...pageProps} />
                </PublicLayout>
              ) : (
                <SecurityProvider>
                  <ServerMessagesProvider>
                    <MainLayout>
                      <Component {...pageProps} />
                    </MainLayout>
                  </ServerMessagesProvider>
                </SecurityProvider>
              )}
            </div>
          </ErrorHandlerProvider>
        </FeedbackProvider>
      </ThemeProvider>
    </>
  )
}
