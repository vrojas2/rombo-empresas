import {
  Button,
  CircularProgress,
  ClickAwayListener,
  Divider,
  Grow,
  Hidden,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@material-ui/core'

import {
  IoPersonOutline,
  IoPeopleOutline,
  IoExitOutline,
  IoEllipsisVertical,
} from 'react-icons/io5'
import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Auth } from 'aws-amplify'
import { useErrorHandler } from '../../providers/errors'
import { useSecurity } from '../../providers/security'
import { useServerMessages } from '../../providers/server-messages'

const ICON_SIZE = '1em'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    paper: {
      marginRight: theme.spacing(0),
      minWidth: '16rem',
    },
  }),
)

export default function PageTopRightMenu(): ReactElement {
  const classes = useStyles()
  const router = useRouter()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const { getCurrentUser } = useSecurity()
  const { handleError } = useErrorHandler()
  const { t } = useTranslation()
  const [user, setUser] = useState<string>()
  const [open, setOpen] = useState(false)
  const { closeConnection } = useServerMessages()

  const logout = async () => {
    closeConnection()
    await Auth.signOut()
    setUser(null)
    setOpen((prevOpen) => !prevOpen)
    if (process.browser) {
      router.reload()
    }
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }

    prevOpen.current = open
  }, [open])

  useEffect(() => {
    getCurrentUser()
      .then((user) =>
        user.getUserAttributes((error, data) => {
          if (error) {
            handleError(t('Error recuperando usuario'), t(''), error)
          } else {
            setUser(data.find(({ Name }) => Name === 'email').Value)
          }
        }),
      )
      .catch((e) => handleError(t('Error recuperando usuario'), t(''), e))
  }, [])

  return (
    <div className={classes.root}>
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          variant="text"
          color="inherit"
          style={{ textTransform: 'none' }}
          endIcon={<IoEllipsisVertical size={ICON_SIZE} />}
        >
          <Hidden xsDown>{user ? user : <CircularProgress />}</Hidden>
        </Button>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper className={classes.paper}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                    <MenuItem>
                      <ListItemIcon>
                        <IoPersonOutline size={ICON_SIZE} />
                      </ListItemIcon>
                      <ListItemText primary={user || ''} />
                    </MenuItem>
                    <Divider />
                    <Divider />
                    <MenuItem onClick={logout}>
                      <ListItemIcon>
                        <IoExitOutline size={ICON_SIZE} />
                      </ListItemIcon>
                      <ListItemText primary={t('cerrar sesión')} />
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  )
}
