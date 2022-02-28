import { ChangeEvent, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Grid,
  makeStyles,
  Theme,
  createStyles,
  FormHelperText,
  FormControl,
} from '@material-ui/core'
import { IoAddCircleOutline, IoDocumentOutline, IoTrashOutline } from 'react-icons/io5'
import { InputFileProps } from '../../propTypes'
import Text from './Text'

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    input: {
      display: 'none',
    },
    button: {
      borderRadius: '0 !important',
      textAlign: 'left',
      fontSize: '1.2em',
      background: '#E0EBF9',
      width: '100%',
      padding: '0.8em 1em',
      cursor: 'pointer',
    },
    label: {
      color: '#366FB8',
    },
    labelError: {
      color: theme.palette.error.main,
    },
    labelDisabled: {
      color: theme.palette.grey[400],
    },
  }),
)

/**
 * Componente para pintar un campo tipo que selecciona un archivo
 * @param setValue any
 * @param name string
 * @param defaultFileName string
 * @param acceptType string (MIMETYPE)
 * @param extensions Array of string (without dot ['doc', 'xls'....])
 * @param maxSize number (Bytes)
 * @param setError any
 * @param clearErrors any
 * @param disabled boolean
 *
 * @returns JSX.Element
 */
export const InputFile = ({
  setValue,
  name,
  defaultFileName,
  acceptType,
  extensions,
  maxSize,
  setError,
  errors,
  clearErrors,
  disabled,
  defaultValue,
}: InputFileProps): JSX.Element => {
  const classes = useStyle()
  const { t } = useTranslation()
  const [fileName, setFileName] = useState(null)

  console.log('defaultValue', defaultValue, defaultFileName)
  useEffect(() => {
    console.log('entra')
    if (defaultValue) {
      setFileName(defaultFileName)
    } else {
      setFileName(undefined)
    }
  }, [defaultFileName, defaultValue])

  const deleteFile = () => {
    if (disabled) {
      return null
    }

    setFileName(null)
    setValue(name, null)
  }

  const changeInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return null
    }

    const fileSelected = event.target.files[0]
    if (fileSelected) {
      const fileSplit = fileSelected.name.split('.')
      if (!extensions.includes(fileSplit[fileSplit.length - 1])) {
        return setError(name, {
          type: 'manual',
          message: t(`Las extensiones aceptadas son ${extensions.map((ext) => `.${ext}`)} `),
        })
      }

      if (fileSelected.size > maxSize) {
        return setError(name, {
          type: 'manual',
          message: t(`El tamaño máximo del archivo es de ${maxSize} `),
        })
      }
    }
    clearErrors(name)
    setFileName(fileSelected.name)
    setValue(name, fileSelected)
  }

  return (
    <>
      {fileName ? (
        <Grid container direction="row" justifyContent="center" alignItems="flex-start" spacing={1}>
          <Grid item xs={2}>
            <IoDocumentOutline size="1.5em" color={disabled ? '#bdbdbd' : '#366FB8'} />
          </Grid>
          <Grid item xs={9} className={disabled ? classes.labelDisabled : classes.label}>
            {fileName}
          </Grid>
          <Grid item xs={1} onClick={deleteFile}>
            <IoTrashOutline size="1.5em" color={disabled ? '#bdbdbd' : 'red'} />
          </Grid>
        </Grid>
      ) : (
        <>
          <Button component="label" variant="text" className={classes.button}>
            <input
              type="file"
              hidden
              onChange={changeInput}
              accept={acceptType || 'application/octet-stream'}
            />
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="flex-start"
              spacing={1}
            >
              <Grid item xs={2}>
                <IoAddCircleOutline size="1.5em" color="#366FB8" />
              </Grid>
              <Grid item xs={10}>
                <Text text="Adjuntar" className={classes.label} />
              </Grid>
            </Grid>
          </Button>
          {errors && errors[name] ? (
            <FormControl>
              <FormHelperText error>{errors[name].message}</FormHelperText>
            </FormControl>
          ) : null}
        </>
      )}
    </>
  )
}

export default InputFile
