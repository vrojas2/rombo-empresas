import { useState, useEffect } from 'react'
import {
  makeStyles,
  Theme,
  createStyles,
  FormHelperText,
  Chip,
  InputBase,
  InputLabel,
  Paper,
} from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import classnames from 'classnames'
import { InputTagsProps } from '../../propTypes'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      display: 'flex',
      flexFlow: 'row wrap',
      padding: '0.1em',
    },
    paper: {
      padding: '0.1em',
      display: 'flex',
      flexFlow: 'row wrap',
      justifyContent: 'flex-start',
      boxShadow: 'none',
    },
    tag: {
      borderRadius: 0,
      margin: '1px',
    },
    formControl: {
      margin: theme.spacing(1),
      width: '100%',
    },
    input: {
      flex: 1,
      paddingLeft: '0.5em',
    },
    label: {
      padding: '0.1em 0 0.1em 0.5em',
    },
  }),
)

/**
 * @params
 * @returns JSX.Element
 */
export const InputTags = ({
  setValue,
  name,
  index,
  fieldArrayName,
  label,
  placeholder,
  classNames,
  disabled,
  errors,
  getValues,
  onDelete,
}: InputTagsProps): JSX.Element => {
  const classes = useStyles()
  const { t } = useTranslation()
  const [tags, setTags] = useState([])

  let nameInput = name
  const fieldArrayInput = Number.isInteger(index) && fieldArrayName
  if (fieldArrayInput) {
    nameInput = `${fieldArrayName}.${index}.${name}`
  }

  useEffect(() => {
    const values = getValues()
    if (values) {
      let value = []
      if (fieldArrayName && values[fieldArrayName] && values[fieldArrayName][index]) {
        value = values[fieldArrayName][index][name]
      } else {
        value = values[name]
      }

      if (value) {
        setTags(value)
      }
    }
  }, [])

  const deleteTag = (i) => {
    setTags((tags) => {
      onDelete(tags.filter((tag, _index) => _index === i))
      const _tags = tags.filter((tag, _index) => _index !== i)
      setValue(nameInput, _tags)
      return _tags
    })
  }

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.type === 'blur') && e.target.value !== '') {
      if (!tags.includes(e.target.value)) {
        setTags((_tags) => {
          const tagsAux = [..._tags, e.target.value]
          setValue(nameInput, tagsAux)
          return tagsAux
        })
        e.target.value = ''
      }
    }
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

  const renderTags = () => {
    if (Array.isArray(tags) && tags.length > 0) {
      return tags.map((tag, i) => (
        <Chip
          key={`chip-input-tag-${i}`}
          label={tag}
          clickable
          onDelete={() => (disabled ? null : deleteTag(i))}
          variant="outlined"
          className={classes.tag}
        />
      ))
    }
  }

  return (
    <Paper
      className={classnames(
        classes.paper,
        'MuiFormControl-root MuiTextField-root MuiInputBase-root MuiFilledInput-root MuiFilledInput-underline MuiInputBase-formControl MuiFormControl-fullWidth',
      )}
    >
      <InputLabel className={classnames(classes.label)} shrink>
        {t(label)}
      </InputLabel>
      <div className={classes.root}>
        {renderTags()}
        {disabled ? null : (
          <InputBase
            className={classes.input}
            placeholder={t(placeholder)}
            error={fieldArrayInput ? !!errors[fieldArrayName]?.[index]?.[name] : !!errors[name]}
            disabled={disabled}
            onBlur={addTag}
            onKeyPress={addTag}
          />
        )}
        {renderError()}
      </div>
    </Paper>
  )
}

export default InputTags
