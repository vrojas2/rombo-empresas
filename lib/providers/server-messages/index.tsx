import React, { PropsWithChildren, ReactElement, useContext } from 'react'
import { createContext } from 'react'
import { w3cwebsocket } from 'websocket'
import getConfig from 'next/config'
import { useEffect } from 'react'
import { UIMessaging } from '@rombomx/ui-messaging-commons'
import { http } from '../../services'
import { useErrorHandler } from '../errors'
import { debug } from '../../services/logger'
import { useState } from 'react'
import { useFeedback } from '../feedback'

const HEAR_BEAT_TIMEOUT = 60 * 5 //5 Minutos

const {
  publicRuntimeConfig: { uiMessagingLoginEndpoint },
} = getConfig()

export type ServerMessagesProps = {
  onMessage: (msgType: string, identifier: string, callback: (message: any) => void) => void
  closeConnection: () => void
}

export const ServerMessagesContext = createContext<ServerMessagesProps>(null)

export const useServerMessages = (): ServerMessagesProps => useContext(ServerMessagesContext)

export const ServerMessagesProvider = ({ children }: PropsWithChildren<any>): ReactElement => {
  const { handleError } = useErrorHandler()
  const uiMessaging = new UIMessaging(uiMessagingLoginEndpoint, handleError, debug, {
    heartBeatSeconds: HEAR_BEAT_TIMEOUT,
  })

  useEffect(() => {
    if (process.browser) {
      debug('conectandose a ui-messaging')
      uiMessaging.connect()
      return () => uiMessaging.close()
    }
  }, [])

  return (
    <ServerMessagesContext.Provider
      value={{
        onMessage: (msgType, identifier, func) => {
          uiMessaging.onMessage(msgType, identifier, func)
        },
        closeConnection: () => {
          uiMessaging.close()
        },
      }}
    >
      {children}
    </ServerMessagesContext.Provider>
  )
}
