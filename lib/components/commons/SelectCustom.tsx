import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  TextField,
  MenuItem,
  makeStyles,
  createStyles,
  FormHelperText,
  Theme,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { SelectTextProps } from '../../propTypes'
import { debug } from '../../services/logger'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      minWidth: 120,
      width: '100%',
    },
  }),
)

/**
 * Componente para pintar en pantalla un selector de opciones
 * @param SelectTextProps
 * @returns JSX.Element
 */
export const SelectCustom = ({
  name,
  label,
  rules,
  autoWidth,
  control,
  errors,
  disabled,
  inputProps,
  variant,
  menuProps,
  index,
  fieldArrayName,
  onChange,
  options,
  returnName,
  native,
  register,
  defaultValue,
  getValues,
  readOnly,
}: SelectTextProps): JSX.Element => {
  const { t } = useTranslation()
  const classes = useStyles()
  let nameInput = name
  const fieldArrayInput = Number.isInteger(index) && fieldArrayName
  if (fieldArrayInput) {
    nameInput = `${fieldArrayName}.${index}.${name}`
  }

  function renderOptions() {
    return (
      Array.isArray(options) &&
      options.length > 0 &&
      options.map((option) => {
        if (native) {
          return <option value={returnName ? option.name : option.id}>{option.name}</option>
        }
        return <MenuItem value={returnName ? option.name : option.id}>{option.name}</MenuItem>
      })
    )
  }

  return (
    <Controller
      control={control}
      name={nameInput}
      defaultValue={defaultValue}
      rules={rules}
      shouldUnregister
      render={({ field }) => {
        return (
          <TextField
            select
            label={t(label)}
            value={field.value}
            defaultValue={defaultValue}
            InputProps={{
              ...inputProps,
              value: field.value,
              readOnly,
            }}
            variant={variant}
            disabled={disabled}
            error={fieldArrayInput ? !!errors[fieldArrayName]?.[index]?.[name] : !!errors[name]}
            helperText={
              fieldArrayInput
                ? errors[fieldArrayName]?.[index]?.[name]?.message
                : errors[name]?.message
            }
            onChange={(e) => {
              if (onChange) {
                return field.onChange(onChange(e.target.value))
              }
              return field.onChange(e.target.value)
            }}
            fullWidth
            {...field}
          >
            <MenuItem value="">
              <em>{t('ninguno')}</em>
            </MenuItem>
            {renderOptions()}
          </TextField>
        )
      }}
    />
  )
}

export default SelectCustom
