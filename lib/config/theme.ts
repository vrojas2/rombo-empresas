import { createTheme } from '@material-ui/core/styles'
import { esES } from '@material-ui/data-grid'

// Create a theme instance.
export const theme = createTheme(
  {
    overrides: {
      MuiButton: {
        root: {
          textTransform: 'capitalize',
          //TODO: lograr que solo la primer letra de cada botón sea mayusucula.
          '>:first-letter, >::first-letter, &:first-letter, &::first-letter, &>:first-letter, &>::first-letter':
            {
              textTransform: 'uppercase',
            },
          borderRadius: 24,
        },
      },
      MuiTextField: {
        root: {
          marginBottom: '1em',
          textTransform: 'initial',
          '&>::first-letter': {
            textTransform: 'uppercase',
          },
        },
      },

      MuiFormControl: {
        root: {
          marginBottom: '1em',
        },
      },
    },
    props: {
      MuiTextField: {
        variant: 'outlined',
      },
      MuiFormControl: {
        variant: 'outlined',
      },
      MuiSelect: {
        variant: 'outlined',
      },
      MuiButton: {
        variant: 'contained',
      },
      MuiNativeSelect: {
        variant: 'outlined',
      },
    },
    palette: {
      //primary: {
      //  main: '#556cd6',
      //},
      //secondary: {
      //  main: '#19857b',
      //},
      //error: {
      //  main: red.A400,
      //},
      //background: {
      //  default: '#ddd',
      //},
    },
  },
  esES,
)

export default theme
