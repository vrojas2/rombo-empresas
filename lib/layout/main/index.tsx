import { makeStyles, Theme } from '@material-ui/core'
export { MainLayout } from './main-layout'
export { Page } from './page'

export const drawerWidth = 240

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    [theme.breakpoints.down('sm')]: {
      width: `100%`,
    },
  },
  appBarTitle: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  drawer: {
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  toolbar: {
    ...theme.mixins.toolbar,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: theme.typography.h6.fontSize,
    paddingRight: theme.spacing(5),
  },
  logo: {
    //transform: 'rotate(45deg)',
    //WebkitTransform: 'rotate(45deg)',
    //marginRight: '0.5em',
    //fontWeight: 'bold',
    //color: theme.palette.primary.main,
    height: theme.spacing(3.5),
    marginRight: theme.spacing(1),
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  backMenuLeft: {
    background: ` linear-gradient(#0000c4, #1cb5e0);   `,
    height: `100%`,
    display: `flex`,
    flexDirection: `column`,
    justifyContent: `space-evenly`
  }
}))
