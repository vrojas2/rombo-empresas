import { useState, useEffect } from 'react'
import { Switch, FormGroup, FormControlLabel, FormHelperText, FormLabel } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { Controller } from 'react-hook-form'
import { SwitchFieldProps } from '../../propTypes'

export const SwitchField = ({
  control,
  name,
  rules,
  fieldArrayName,
  index,
  errors,
  label,
  title,
  color,
  defaultValue,
  setValueToForm,
}: SwitchFieldProps): JSX.Element => {
  const { t } = useTranslation()
  let nameInput = name
  const fieldArrayInput = Number.isInteger(index) && fieldArrayName
  const [value, setValue] = useState<boolean>(false)
  if (fieldArrayInput) {
    nameInput = `${fieldArrayName}.${index}.${name}`
  }

  useEffect(() => {
    setValue(defaultValue)
    setValueToForm(nameInput, defaultValue)
  }, [defaultValue])

  function changeValue(e) {
    setValue(e.target.checked)
    setValueToForm(nameInput, e.target.checked)
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
    <FormGroup>
      {title ? <FormLabel component="legend">{t(title)}</FormLabel> : null}
      <FormControlLabel
        control={<Switch checked={value} value={value} color={color || 'primary'} />}
        onChange={changeValue}
        label={t(label)}
      />
      {renderError()}
    </FormGroup>
  )
  //   return (
  //     <Controller
  //       control={control}
  //       name={nameInput}
  //       rules={rules}
  //       render={({ field }) => {
  //         console.log('field', field)
  //         return (
  //           <FormGroup>
  //             {title ? <FormLabel component="legend">{t(title)}</FormLabel> : null}
  //             <FormControlLabel
  //               control={
  //                 <Switch checked={field.value} value={field.value} color={color || 'primary'} />
  //               }
  //               onChange={field.onChange}
  //               label={t(label)}
  //             />
  //             {renderError()}
  //           </FormGroup>
  //         )
  //       }}
  //     />
  //   )
}

export default SwitchField
