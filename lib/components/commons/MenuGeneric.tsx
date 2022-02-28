import { useState, PropsWithChildren } from 'react'
import { IoEllipsisVerticalSharp } from 'react-icons/io5'
import { Menu, MenuItem, Button, createStyles, makeStyles, Theme, Grid } from '@material-ui/core'
import Fade from '@material-ui/core/Fade'
import { useTranslation } from 'react-i18next'
import { isValidArray } from '@rombomx/ui-commons'
import { MenuGenericProps } from '../../propTypes'

const ICON_SIZE = '1.5em'

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    moreActions: {
      cursor: 'pointer',
    },
    gridTitle: {
      paddingLeft: '10px',
      paddingRight: '5px',
    },
    cursorPointer: {
      cursor: 'pointer',
    },
  }),
)
export const MenuGeneric = ({
  options,
  children,
}: PropsWithChildren<MenuGenericProps>): JSX.Element => {
  const { t } = useTranslation()
  const classes = useStyle()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const openMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  const selectItem = (e, action) => {
    action()
    setAnchorEl(null)
  }

  return (
    <>
      <Button variant="text" aria-controls="menu-generic" aria-haspopup="true" onClick={openMenu}>
        {children ? (
          children
        ) : (
          <IoEllipsisVerticalSharp className={classes.moreActions}></IoEllipsisVerticalSharp>
        )}
      </Button>
      <Menu
        id="menu-generic"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={closeMenu}
        TransitionComponent={Fade}
      >
        {isValidArray(options)
          ? options.map(({ title, icon: Icon, action }, i) => {
              return (
                <MenuItem
                  onClick={(e) => selectItem(e, action)}
                  className={classes.cursorPointer}
                  key={`menu-item-${i}`}
                >
                  <Grid
                    container
                    spacing={1}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                    direction="row"
                  >
                    {Icon ? <Grid>{<Icon size={ICON_SIZE} />}</Grid> : null}
                    <Grid className={classes.gridTitle}>{t(title)}</Grid>
                  </Grid>
                </MenuItem>
              )
            })
          : null}
      </Menu>
    </>
  )
}

export default MenuGeneric
