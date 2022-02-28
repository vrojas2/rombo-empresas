import { Drawer, Hidden, makeStyles, useTheme, Theme } from '@material-ui/core'
import Head from 'next/head'
import { PropsWithChildren, useState } from 'react'

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
}))

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   */
  window?: () => Window
}

export const PublicLayout = ({ children, window }: PropsWithChildren<Props>): JSX.Element => {
  const classes = useStyles()
  const theme = useTheme()

  return (
    <div className={classes.root}>
      <Head>
        <title>Rombo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={classes.content}>{children}</main>
    </div>
  )
}
