import { useEffect, useState } from 'react'
import { TextField, makeStyles, createStyles, Theme, CircularProgress } from '@material-ui/core'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'
import { SearchResults } from '@rombomx/models'
import { isValidArray } from '@rombomx/ui-commons'
import { AutoCompleteProps, SelectOptionsProps } from '../../propTypes'
import { searchItems } from '../../services'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    field: {
      border: '1px solid $gray7',
      borderRadius: '2px',
      backgroundColor: theme.palette.grey[100],
      boxShadow: '0 0 14px 0 rgba(0,0,0,0.1)',
    },
    fieldDisabled: {
      borderRadius: '2px',
      backgroundColor: theme.palette.grey[100],
      boxShadow: '0 0 14px 0 rgba(0,0,0,0.1)',
      color: theme.palette.grey[900],
      border: '1px solid $gray7',
    },
    label: {
      color: theme.palette.info.main,
    },
  }),
)

/**
 * Componente para mostrar un campo de autocompletado de texto con MUI
 * @param AutoCompleteProps
 * @returns JSX.Element
 */
export const AutocompleteField = ({
  name,
  label,
  placeholder,
  fullWidth,
  required,
  errors,
  disabled,
  inputProps,
  inputLabelProps,
  index,
  fieldArrayName,
  options,
  src,
  path,
  freeSolo,
  srcMapper,
  onChange,
  clearOnSelect,
  onChangeInput,
  catalog,
  reset,
  defaultValue,
  readOnly,
}: AutoCompleteProps): JSX.Element => {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState(null)
  const [query, setQuery] = useState(null)
  const { t } = useTranslation()
  const classes = useStyles()
  let nameInput = name
  const fieldArrayInput = Number.isInteger(index) && fieldArrayName
  const [optionsState, setOptionsState] = useState<SelectOptionsProps[]>([
    { id: 0, name: t('No hay coincidencias'), row: {} },
  ])
  const [loading, setLoading] = useState<boolean>(false)

  const search = async (active) => {
    try {
      if (!active) {
        return
      }
      let options = {}
      if (src) {
        options = { query, path, size: 100, autocomplete: catalog }
      }
      if (query === '' || query === 0) {
        return
      }

      const data: SearchResults<any> = await searchItems<any>(src, options)
      if (data && data.items.length === 0) {
        setOptionsState([{ id: 0, name: t('No hay coincidencias'), row: {} }])
      }

      setOptionsState(srcMapper(data))
    } catch (e) {
      console.log('error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    if (src) {
      if (!loading) {
        return undefined
      }

      search(active)
    }

    return () => {
      active = false
    }
  }, [loading])

  useEffect(() => {
    if (options) {
      setOptionsState(options)
    }
  }, [options])

  useEffect(() => {
    if (defaultValue) {
      if (isValidArray(optionsState)) {
        const existe = optionsState.find(({ id }) => id == defaultValue.id)
        if (!existe) {
          setOptionsState([...optionsState, defaultValue])
        }
      }
    }
  }, [defaultValue])

  useEffect(() => {
    if (reset) {
      setKey(Math.random())
    }
  }, [reset])

  if (fieldArrayInput) {
    nameInput = `${fieldArrayName}.${index}.${name}`
  }

  const changeAutocomplete = (e, value, reason) => {
    onChange(value)
    if (clearOnSelect) {
      setKey(Math.random())
    }
  }
  const changeInput = debounce((e, value, reason) => {
    if (onChangeInput) {
      onChangeInput(value)
    }

    if (src) {
      setQuery(value)
      setLoading(true)
    }
  }, 500)

  return (
    <Autocomplete
      key={key}
      id={`autocomplete-${nameInput}`}
      freeSolo={freeSolo}
      selectOnFocus
      autoComplete
      disabled={disabled}
      disableClearable
      onOpen={() => {
        if (src && !readOnly) {
          setOpen(true)
        }
      }}
      onClose={() => {
        if (src) {
          setOpen(false)
        }
      }}
      options={optionsState}
      value={defaultValue}
      loadingText={t('cargando...')}
      onChange={changeAutocomplete}
      onInputChange={changeInput}
      getOptionLabel={(option) => option?.name || ''}
      loading={loading}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={t(label)}
            name={nameInput}
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
              ...params.InputProps,
              readOnly,
              type: 'search',
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {inputProps.endAdornment}
                </>
              ),
              classes: disabled ? classes.fieldDisabled : classes.field,
            }}
            InputLabelProps={{ ...inputLabelProps, classes: classes.label }}
          />
        )
      }}
    />
  )
}

export default AutocompleteField
