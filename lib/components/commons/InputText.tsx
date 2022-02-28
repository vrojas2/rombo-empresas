import { Controller } from 'react-hook-form'
import { TextField, makeStyles, createStyles, Theme } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { InputTextProps } from '../../propTypes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    field: {
      //border: '1px solid $gray7',
      //borderRadius: '2px',
      //backgroundColor: theme.palette.grey[100],
      //boxShadow: '0 0 14px 0 rgba(0,0,0,0.1)',
    },
    fieldDisabled: {
      //borderRadius: '2px',
      //backgroundColor: theme.palette.grey[100],
      //boxShadow: '0 0 14px 0 rgba(0,0,0,0.1)',
      //color: theme.palette.grey[900],
      //border: '1px solid $gray7',
    },
    label: {
      //color: theme.palette.info.main,
    },
  }),
)
/**
 * Componente para mostrar un campo de texto con MUI
 * @param InputTextProps
 * @returns JSX.Element
 */
export const InputText = ({
  name,
  label,
  placeholder,
  rules,
  fullWidth,
  required,
  control,
  errors,
  disabled,
  inputProps,
  inputLabelProps,
  index,
  fieldArrayName,
  type,
  readOnly = false,
}: InputTextProps): JSX.Element => {
  const { t } = useTranslation()
  const classes = useStyles()
  let nameInput = name
  const fieldArrayInput = Number.isInteger(index) && fieldArrayName
  if (fieldArrayInput) {
    nameInput = `${fieldArrayName}.${index}.${name}`
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
          <TextField
            type={type || 'text'}
            label={t(label)}
            placeholder={t(placeholder)}
            fullWidth={fullWidth}
            required={required}
            disabled={disabled}
            className={disabled ? classes.fieldDisabled : classes.field}
            error={fieldArrayInput ? !!errors[fieldArrayName]?.[index]?.[name] : !!errors[name]}
            helperText={
              fieldArrayInput
                ? errors[fieldArrayName]?.[index]?.[name]?.message
                : errors[name]?.message
            }
            InputProps={{
              ...inputProps,
              readOnly,
              classes: disabled ? classes.fieldDisabled : classes.field,
              value: field.value,
            }}
            {...field}
            InputLabelProps={{ ...inputLabelProps, classes: classes.label }}
          />
        )
      }}
    />
  )
  // primera version, tiene error el label flotante
  // const { ref: nombreRef, ...nombreProps } = register(nameInput, rules)
  // return (
  //   <TextField
  //     inputRef={nombreRef}
  //     //     {...register(nameInput, rules)}
  //     {...nombreProps}
  //     label={t(label)}
  //     placeholder={t(placeholder)}
  //     fullWidth={fullWidth}
  //     required={required}
  //     error={!!errors.nameInput}
  //     helperText={errors.nameInput?.message}
  //   />
  // )
}

export default InputText
