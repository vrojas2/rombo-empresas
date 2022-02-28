import { FormControlLabel, Checkbox, FormControl, FormHelperText } from '@material-ui/core'
import { Controller } from 'react-hook-form'
import Text from './Text'
import { CheckBoxCustomProps } from '../../propTypes'

/**
 * Componente para mostrar un checkbox
 * @param CheckBoxCustomProps
 * @returns JSX.Element
 */
export const CheckBoxCustom = ({
  name,
  label,
  control,
  errors,
  disabled,
  color,
  onChange,
  index,
  fieldArrayName,
  rules,
  readOnly,
}: CheckBoxCustomProps): JSX.Element => {
  let nameInput = name
  const fieldArrayInput = Number.isInteger(index) && fieldArrayName
  if (fieldArrayInput) {
    nameInput = `${fieldArrayName}.${index}.${name}`
  }

  function getError() {
    if (
      fieldArrayInput &&
      errors[fieldArrayName] &&
      errors[fieldArrayName][index] &&
      errors[fieldArrayName][index][name]
    ) {
      return errors[fieldArrayName][index][name].message
    }

    return errors?.name?.message
  }

  function renderError() {
    if (fieldArrayInput) {
      if (
        errors[fieldArrayName] &&
        errors[fieldArrayName][index] &&
        errors[fieldArrayName][index][name]
      ) {
        return <FormHelperText error>{errors[fieldArrayName][index][name]?.message}</FormHelperText>
      }
    }

    return <FormHelperText error>{errors?.[name]?.message}</FormHelperText>
  }

  return (
    <Controller
      name={nameInput}
      control={control}
      defaultValue={false}
      rules={rules}
      render={({ field }) => {
        return (
          <FormControl required={rules?.required} error={getError()} component="fieldset">
            <FormControlLabel
              label={<Text text={label} />}
              control={
                <Checkbox
                  {...field}
                  name={nameInput}
                  inputProps={{ readOnly }}
                  checked={field.value}
                  onChange={(e) => {
                    if (onChange) {
                      return field.onChange(onChange(e.target.checked))
                    }
                    field.onChange(e.target.checked)
                  }}
                  color={color || 'primary'}
                />
              }
              disabled={disabled}
            />
            {renderError()}
          </FormControl>
        )
      }}
    />
  )
}

export default CheckBoxCustom
