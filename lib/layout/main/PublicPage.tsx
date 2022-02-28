import Head from 'next/head'
import React, { PropsWithChildren } from 'react'

type PageProps = {
  title: string
}

export const PublicPage = ({ title, children }: PropsWithChildren<PageProps>): JSX.Element => {
  const capitalizedTitle = `${title.charAt(0).toLocaleUpperCase()}${title.substring(1)}`

  return (
    <>
      <Head>
        <title>{capitalizedTitle} | Rombo</title>
      </Head>
      {children}
    </>
  )
}

export default PublicPage
