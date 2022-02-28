import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import {
  IoHomeOutline,
  IoPodiumOutline,
  IoPeopleOutline,
  IoReceiptOutline,
  IoPricetagsOutline,
  IoSettingsOutline,
} from 'react-icons/io5'

import { createStyles, Hidden, Theme } from '@material-ui/core'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'react-i18next'

const ICON_SIZE = '2em'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    padding: {
      height: theme.spacing(4),
    },
    root: {
      width: '100vw',
      position: 'fixed',
      zIndex: theme.zIndex.appBar,
      left: 0,
      bottom: 0,
    },
  }),
)

export default function MobileBottomNavigation(): JSX.Element {
  const classes = useStyles()
  const router = useRouter()
  const { t } = useTranslation()
  const [value, setValue] = React.useState('recents')

  const handleChange = (event: React.ChangeEvent<any>, path: string) => {
    router.push(path)
  }

  return (
    <Hidden smUp>
      <div className={classes.padding} />
      <BottomNavigation
        showLabels
        value={router.asPath}
        onChange={handleChange}
        className={classes.root}
      >
        <BottomNavigationAction
          label={t('facturas')}
          value="/facturas"
          icon={<IoReceiptOutline size={ICON_SIZE} />}
        />
        <BottomNavigationAction
          label="Clientes"
          value="/clientes"
          icon={<IoPeopleOutline size={ICON_SIZE} />}
        />
        <BottomNavigationAction
          label="Articulos"
          value="/articulos"
          icon={<IoPricetagsOutline size={ICON_SIZE} />}
        />
      </BottomNavigation>
    </Hidden>
  )
}
