import { Button, Hidden, IconButton, Tooltip } from '@material-ui/core'
import Link from 'next/link'
import { ReactElement } from 'react'

type ActionLinkProps = {
  label: string
  href: string
  icon: ReactElement<any, any>
  color?: 'inherit' | 'primary' | 'secondary' | 'default'
}
export default function ActionLink({
  href,
  icon,
  label,
  color = 'default',
}: ActionLinkProps): JSX.Element {
  return (
    <>
      <Hidden smDown>
        <Link href={href} passHref>
          <Button color={color} fullWidth startIcon={icon}>
            {label}
          </Button>
        </Link>
      </Hidden>
      <Hidden mdUp>
        <Link href={href} passHref>
          <Tooltip title={label} aria-label="add">
            <IconButton color={color}>{icon}</IconButton>
          </Tooltip>
        </Link>
      </Hidden>
    </>
  )
}
