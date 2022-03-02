import { Card, Grid, makeStyles, Theme, createStyles } from '@material-ui/core'
import Link from 'next/link'
import { IoChevronForwardOutline, IoPricetagsOutline, IoPersonOutline } from 'react-icons/io5'

import { Page } from '../../lib/layout/main'
import { Text } from '../../lib/components/commons'
const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      justifyContent: 'center',
      
      alignItems:'center',
      flexFlow: 'row',
      height: '80vh',
    },
   
    card: {
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      
      width: '40%',
      margin: '1% 1em',
      padding: '1em 0',
      cursor: 'pointer',
      height: '400px',
      color:'white',   
      borderRadius: '50px',
      background: 'linear-gradient(to bottom right, #21D4FD 0%, #B721FF 100%);',
      boxShadow: '1px 1px 6px #B721FF, -1px 0 6px 0px #21D4FD;',
    },
   
    text: {
      textAlign:'center',
    },
    title: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '2em',
      flexFlow: 'column',
    },
    cardContainer:{
      display:'flex',
      backgroundColor:'red'
    },
    
  }),
)

type CardProps = {
  title: string
  url: string
  icon: JSX.Element
}

const ICON_SIZE = '2em'

const CardSection = ({ title, url, icon }: CardProps) => {
  const classes = useStyle()
  if (!title && !url && !icon) {
    return null
  }
  return (
    <Link href={url} >
      <Card className={classes.card}>
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={0}
          className={classes.grid}
        >
          <Grid item xs={10}>
            <Grid container direction="row" alignItems="center">
              <Grid item xs={0} className={classes.grid}>
                <div className={classes.title}>
                  {icon}
                  <Text text={title} className={classes.text} />
                </div>
              </Grid>
            </Grid>
          </Grid>
          
        </Grid>
      </Card>
    </Link>
  )
}
export const ReportesPage = (): JSX.Element => {
  const classes = useStyle()
  return (
    <Page title="Reportes">
      <div className={classes.container}>
        <CardSection 
          title="Ventas por artículo"
          url="/reportes/ventas-por-articulo"
          icon={<IoPricetagsOutline size={ICON_SIZE} />}
        />
        <CardSection 
          title="Ventas por cliente"
          url="/reportes/ventas-por-cliente"
          icon={<IoPersonOutline size={ICON_SIZE} />}
        />
      </div>
    </Page>
  )
}

export default ReportesPage
