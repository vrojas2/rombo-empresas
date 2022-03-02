import { Button, Hidden, IconButton, Tooltip, makeStyles } from '@material-ui/core'
import Link from 'next/link'
import { ReactElement } from 'react'

type ActionLinkProps = {
  label: string
  href: string
  icon: ReactElement<any, any>
  color?: 'inherit' | 'primary' | 'secondary' | 'default'
}
const useStyles = makeStyles({
  buton: {
    height: '50px',
    minWidth:'160px',
    margin:'20px 0',
    maxWidth:'200px',
    borderRadius: '50px',
    background: 'linear-gradient(to bottom right, #21D4FD 0%, #B721FF 100%);',
    boxShadow: '1px 1px 3px #B721FF, -1px 0 3px 0px #21D4FD;',
  },
});
export default function ActionLink({
  href,
  icon,
  label,
  color = 'default',
}: ActionLinkProps): JSX.Element {
  const classes = useStyles()
  return (
    <>
      <Hidden smDown>
        <Link href={href} passHref>
          <Button color={color} fullWidth startIcon={icon} className={classes.buton}>
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
