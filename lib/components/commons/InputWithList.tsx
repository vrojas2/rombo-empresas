import { useState } from 'react'
import {
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  makeStyles,
  Theme,
  createStyles,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { IoChevronDown } from 'react-icons/io5'
import { InputWithListProps, SelectOptionsProps } from '../../propTypes'
import { isValidArray } from '@rombomx/ui-commons'
// "outlined"
// "small"
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menu: {
      zIndex: 9999,
    },
    display: {
      width: 100,
    },
    selectorStart: {
      cursor: 'pointer',
      borderRight: `1px solid ${theme.palette.grey[600]}`,
      paddingRight: '0.5em',
    },
    selectorEnd: {
      cursor: 'pointer',
      borderLeft: `1px solid ${theme.palette.grey[600]}`,
      paddingLeft: '0.5em',
    },
  }),
)

export const InputWithList = ({
  label,
  size,
  variant,
  deshabilitado,
  options,
  side,
  onChangeList,
  onChange,
  defaultValue,
}: InputWithListProps): JSX.Element => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [valueList, setValueList] = useState<SelectOptionsProps>({
    id: 0,
    name: 'Elige',
  })
  const [value, setValue] = useState(null)

  const classes = useStyles()
  const { t } = useTranslation()

  const open = (event) => {
    if (event && event.target) {
      setAnchorEl(event.target)
    }
  }

  const close = () => {
    setAnchorEl(null)
  }

  const selectedValue = (event, index) => {
    setValueList(options[index])
    close()
    onChangeList(options[index])
  }

  const change = (e) => {
    setValue(e.target.value)
    onChange(e.target.value)
  }
  const renderMenu = () => {
    if (!isValidArray(options)) {
      return null
    }
    console.log('value', value)
    let classSelector = null
    if (side === 'start') {
      classSelector = classes.selectorStart
    }

    if (side === 'end') {
      classSelector = classes.selectorEnd
    }

    return (
      <>
        <div onClick={open} className={classSelector}>
          <span className={classes.display}>{valueList?.name}</span>
          <IoChevronDown />
        </div>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          className={classes.menu}
          onClose={close}
        >
          <em>{t('ninguno')}</em>
          {options.map((option, index) => (
            <MenuItem
              key={`menu-item-select-${option.id}`}
              value={option.id}
              onClick={(e) => selectedValue(e, index)}
              selected={option.id === valueList.id}
            >
              {option.name}
            </MenuItem>
          ))}
        </Menu>
      </>
    )
  }

  return (
    <TextField
      variant={variant}
      label={t(label)}
      disabled={deshabilitado}
      onChange={change}
      value={value}
      required
      size={size}
      fullWidth
      InputProps={{
        startAdornment:
          side === 'start' ? (
            <InputAdornment position="start">{renderMenu()}</InputAdornment>
          ) : null,
        endAdornment:
          side === 'end' ? <InputAdornment position="end">{renderMenu()}</InputAdornment> : null,
      }}
    />
  )
}

export default InputWithList
