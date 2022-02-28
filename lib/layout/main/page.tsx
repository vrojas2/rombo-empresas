import Head from 'next/head'
import { AppBar, IconButton, Toolbar, Typography } from '@material-ui/core'
import React, { PropsWithChildren } from 'react'
import { useStyles } from '.'
import { IoMenuOutline } from 'react-icons/io5'
import { useLayout } from './main-layout'
import PageTopRightMenu from './PageTopRightMenu'
import MobileBottomNavigation from '../../components/commons/MobileBottomNavigation'
import { SubscriptionsProvider } from '../../providers/subscriptions'

type PageProps = {
  title: string
}

export const Page = ({ title, children }: PropsWithChildren<PageProps>): JSX.Element => {
  const classes = useStyles()
  const { toggleDrawer } = useLayout()
  const capitalizedTitle = `${title.charAt(0).toLocaleUpperCase()}${title.substr(1)}`

  return (
    <>
      <Head>
        <title>{capitalizedTitle} | Rombo</title>
      </Head>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap className={classes.appBarTitle}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              className={classes.menuButton}
              onClick={toggleDrawer}
            >
              <IoMenuOutline />
            </IconButton>
            {capitalizedTitle}
          </Typography>
          <PageTopRightMenu />
        </Toolbar>
      </AppBar>
      <SubscriptionsProvider>{children}</SubscriptionsProvider>
      <MobileBottomNavigation />
    </>
  )
}

export default Page
