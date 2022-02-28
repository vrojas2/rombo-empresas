import {
  Button,
  createStyles,
  Grid,
  Hidden,
  makeStyles,
  Theme,
  useTheme,
  Zoom,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab'
import { useState } from 'react'
import { ReactElement } from 'react'

export type ActionList = Array<{
  label: string
  icon: ReactElement<any, any>
  onClick: () => void
  color?: 'primary' | 'secondary' | 'default'
}>

export type ActionMenuProps = {
  actionList: ActionList
  show: boolean
  bottomMargin?: number
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      position: 'relative',
      marginTop: theme.spacing(0),
      height: 0,
    },
    speedDial: {
      zIndex: theme.zIndex.drawer,
      position: 'absolute',
      right: 0,
      top: -10,
      '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
        bottom: theme.spacing(0),
        //right: theme.spacing(2),
      },
      '&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight': {
        top: theme.spacing(-8),
        //left: theme.spacing(2),
      },
    },
    speedDialTooltip: {
      minWidth: '200px',
    },
  }),
)

export default function ActionMenu({
  actionList,
  show,
  bottomMargin,
}: ActionMenuProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false)
  const classes = useStyles()
  const { t } = useTranslation()
  const theme = useTheme()
  const handleClose = () => {
    setOpen(false)
  }

  const handleOpen = () => {
    setOpen(true)
  }

  return (
    <>
      <Hidden xsDown smUp={!show}>
        <Zoom in={show}>
          <Grid
            container
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            style={{
              marginBottom: theme.spacing(bottomMargin || 0),
            }}
          >
            {actionList.map(({ icon, label, onClick, color }) => (
              <Grid key={`action-desktop-${label.replace(/ /g, '-')}`} item>
                <Button
                  size="small"
                  startIcon={icon}
                  color={color || 'secondary'}
                  onClick={onClick}
                >
                  {t(label)}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Zoom>
      </Hidden>
      <Hidden smUp implementation="css">
        <div className={classes.wrapper}>
          <SpeedDial
            className={classes.speedDial}
            icon={<SpeedDialIcon />}
            ariaLabel="Action Menu"
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            hidden={!show}
            direction="down"
          >
            {actionList.map(({ icon, label, onClick }) => (
              <SpeedDialAction
                key={`action-mobile-${label.replace(/ /g, '-')}`}
                tooltipTitle={<div className={classes.speedDialTooltip}>{t(label)}</div>}
                tooltipOpen
                icon={icon}
                onClick={onClick}
                FabProps={{
                  color: 'secondary',
                  size: 'small',
                }}
              />
            ))}
          </SpeedDial>
        </div>
      </Hidden>
    </>
  )
}
