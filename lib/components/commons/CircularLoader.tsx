import React from 'react'
import { makeStyles, Theme, createStyles, CircularProgress } from '@material-ui/core'

interface LoaderProps {
  active: boolean
  color?: 'inherit' | 'primary' | 'secondary'
}
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      '& > * + *': {
        marginLeft: theme.spacing(2),
      },
    },
  }),
)

export const CircularLoader = ({ color, active }: LoaderProps): JSX.Element => {
  const classes = useStyles()

  if (!active) return null

  return (
    <div className={classes.root}>
      <CircularProgress color={color} />
    </div>
  )
}

CircularLoader.props = {
  color: 'primary',
}

export default CircularLoader
