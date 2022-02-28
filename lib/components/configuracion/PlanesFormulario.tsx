import { Grid, Card, CardContent, Button } from '@material-ui/core'
import { MdCheck } from 'react-icons/md'

export const Planes = ({ planes }: { planes: any }): JSX.Element => {
  return (
    <Grid container direction="column" spacing={2}>
      <Grid container direction="row" alignItems="center">
        {planes &&
          planes.map((field, idx) => (
            <Grid item xs={4} key={idx}>
              <Card className="grid-95">
                <CardContent>
                  <h2 className="blue-name">Nombre: {field?.nombre.toString()}</h2>
                </CardContent>
                <CardContent className="align-left">
                  {field?.detalles.map((detalle, idy) => (
                    <a key={idy}>
                      <MdCheck /> {detalle}
                      <br />
                    </a>
                  ))}
                </CardContent>
                <CardContent>
                  <h4>Precio: {field.descripcion}</h4>
                  <Button>Elegir este plan</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Grid>
  )
}

export default Planes
