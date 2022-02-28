import { ListItem, ListItemIcon, ListItemText } from '@material-ui/core'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import Link from 'next/link'

type MenuLinkProps = {
  label: string
  Icon: any
  href: string
  iconSize?: string
}

export const MenuLink = ({ label, Icon, href, iconSize }: MenuLinkProps): JSX.Element => {
  return (
    <Link href={href}>
      <ListItem button>
        <ListItemIcon>
          <Icon size={iconSize || '3em'} />
        </ListItemIcon>
        <ListItemText primary={label} style={{ textTransform: 'capitalize' }} />
      </ListItem>
    </Link>
  )
}

export default MenuLink
