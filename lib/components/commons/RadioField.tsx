import React from 'react'
import { useTranslation } from 'react-i18next'
import { isValidArray } from '@rombomx/ui-commons'
import { Controller } from 'react-hook-form'
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@material-ui/core'

import { RadioFieldProps } from '../../propTypes'

export const RadioField = ({
  options,
  control,
  title,
  name,
  rules,
  defaultValue,
  fieldArrayName,
  index,
  vertical = false,
  errors,
}: RadioFieldProps): JSX.Element => {
  const { t } = useTranslation()
  //   const classes = useStyles()
  let nameInput = name
  const fieldArrayInput = Number.isInteger(index) && fieldArrayName
  if (fieldArrayInput) {
    nameInput = `${fieldArrayName}.${index}.${name}`
  }

  const renderRadio = () => {
    if (!isValidArray(options)) {
      return null
    }
    return options.map((option) => (
      <FormControlLabel value={option.value} control={<Radio />} label={option.label} />
    ))
  }

  function renderError() {
    console.log('errors', errors)
    console.log('errors', errors[name])
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
      control={control}
      name={nameInput}
      defaultValue=""
      rules={rules}
      shouldUnregister
      render={({ field }) => {
        return (
          <FormControl component="fieldset">
            {title ? <FormLabel component="legend">{title}</FormLabel> : null}
            {/* <RadioGroup aria-label="gender" name="gender1" value={value} onChange={handleChange}> */}
            <RadioGroup row={!vertical} aria-label="radio-field" name="radio-field" {...field}>
              {renderRadio()}
            </RadioGroup>
            {renderError()}
          </FormControl>
        )
      }}
    />
  )
}

export default RadioField
