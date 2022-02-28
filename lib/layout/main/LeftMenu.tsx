import { Divider, List } from '@material-ui/core'
import {
  IoHomeOutline,
  IoPodiumOutline,
  IoPeopleOutline,
  IoReceiptOutline,
  IoPricetagsOutline,
  IoSettingsOutline,
} from 'react-icons/io5'
import { useTranslation } from 'react-i18next'
import { useStyles } from '.'
import MenuLink from './MenuLink'

export default function LeftMenu(): JSX.Element {
  const classes = useStyles()
  const { t } = useTranslation()
  return (
    <>
      <div className={classes.toolbar}>
        <img src="/logo.png" alt="logo" className={classes.logo} />
        Rombo
      </div>
      <Divider />
      <List>
        <MenuLink label={t('inicio')} Icon={IoHomeOutline} href="/" iconSize="2em" />
        <MenuLink label={t('facturas')} Icon={IoReceiptOutline} href="/facturas" iconSize="2em" />
        <MenuLink label={t('clientes')} Icon={IoPeopleOutline} href="/clientes" iconSize="2em" />
        <MenuLink
          label={t('articulos')}
          Icon={IoPricetagsOutline}
          href="/articulos"
          iconSize="2em"
        />
        <MenuLink label={t('reportes')} Icon={IoPodiumOutline} href="/reportes" iconSize="2em" />
        <Divider />
        <MenuLink
          label={t('configuración')}
          Icon={IoSettingsOutline}
          href="/configuracion"
          iconSize="2em"
        />
      </List>
    </>
  )
}
