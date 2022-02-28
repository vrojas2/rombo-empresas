import { Drawer, Hidden, useTheme } from '@material-ui/core'
import { createContext, PropsWithChildren, useContext, useState } from 'react'
import Head from 'next/head'
import { useStyles } from '.'
import LeftMenu from './LeftMenu'

export type LayoutContextProps = {
  toggleDrawer: () => void
}

export const LayoutContext = createContext<LayoutContextProps>(null)

export const useLayout = (): LayoutContextProps => useContext(LayoutContext)
interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   */
  window?: () => Window
}

export const MainLayout = ({ children, window }: PropsWithChildren<Props>): JSX.Element => {
  const classes = useStyles()
  const theme = useTheme()

  const [mobileOpen, setMobileOpen] = useState<boolean>(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = <LeftMenu />

  const container = window !== undefined ? () => window().document.body : undefined

  return (
    <div className={classes.root}>
      <Head>
        <title>Rombo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden mdUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left"
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <LayoutContext.Provider
          value={{
            toggleDrawer: handleDrawerToggle,
          }}
        >
          {children}
        </LayoutContext.Provider>
      </main>
    </div>
  )
}
