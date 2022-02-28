import { PropsWithChildren } from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'

import { useTranslation } from 'react-i18next'

import DialogTitle from '@material-ui/core/DialogTitle'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core/styles'
import { DialogGenericProps } from '../../propTypes'

export const DialogGeneric = function ({
  open,
  actions,
  text,
  title,
  buttons,
  handleClose,
  children,
  size,
  fullWidth,
}: PropsWithChildren<DialogGenericProps>): JSX.Element {
  const theme = useTheme()
  const { t } = useTranslation()
  const fullScreen = useMediaQuery(theme.breakpoints.down(size))

  function renderContent() {
    if (text) {
      return <DialogContentText>{t(text.toString())}</DialogContentText>
    }
    return children
  }

  function renderButtons(): Array<JSX.Element> {
    return buttons.map((button): JSX.Element => {
      return (
        <Button autoFocus onClick={button.onClick || handleClose} color={button.color || 'primary'}>
          {button.title}
        </Button>
      )
    })
  }

  return (
    <>
      <Dialog
        fullScreen={fullScreen}
        fullWidth={fullWidth}
        open={open}
        // onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">{t(title.toString())}</DialogTitle>
        <DialogContent>{renderContent()}</DialogContent>
        <DialogActions>
          {actions && Array.isArray(buttons) && buttons.length > 0 && renderButtons()}
        </DialogActions>
      </Dialog>
    </>
  )
}

DialogGeneric.defaultProps = {
  actions: true,
  size: 'sm',
  fullWidth: false,
}

export default DialogGeneric
