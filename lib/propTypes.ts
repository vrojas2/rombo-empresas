import { ReactElement, ReactNode, Dispatch, SetStateAction } from 'react'
import { Control } from 'react-hook-form'
import { IconType } from 'react-icons'

import {
  Direccion,
  SatImpuesto,
  SearchResults,
  ClienteDeEmpresa,
  PermisosResponse,
} from '@rombomx/models/lib'
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints'

export type ClienteRequest = {
  nombre: string
  rfc: string
  telefono: string
  codigoPaisTelefono: number
  correo?: string
  referencia: string
  direcciones: Array<Direccion>
}

export type PageProps = {
  id: number
}

export type BotonesDetalle = {
  titulo: string
  onClick?: (fn?: () => void) => void
  color?: 'primary' | 'secondary' | 'default' | 'inherit'
  icono?: ReactElement
  variante?: 'text' | 'outlined' | 'contained'
  principal?: boolean
}

export type BotonesFacturaDetalle = {
  principales: Array<BotonesDetalle>
  secundarios: Array<BotonesDetalle>
}

export type DetailProps = {
  id?: number
  mostrar: boolean
  titulo: string
  cerrar?: () => void
  cargarDatos?: () => void
}

export type ButtonsDialog = {
  title: string
  onClick?: () => void
  color?: 'primary' | 'secondary' | 'default' | 'inherit'
}

export type DialogGenericProps = {
  open: boolean
  actions: boolean
  size?: Breakpoint
  text?: string | JSX.Element
  title?: string | JSX.Element
  buttons?: Array<ButtonsDialog>
  handleClose: () => void
  children?: ReactNode
  fullWidth?: boolean
}

export type ArticuloRequest = {
  nombre: string
  satClaveProdServId: number
  clave: string
  unidadMedida?: any
  precio?: string | number
  variantes?: Array<any>
  articuloCaracteristicas?: Array<any>
  impuestos?: Array<any>
  tieneVariantes?: boolean
  variantesBorradas?: Array<any>
  otros?: Array<any>
}

export type Impuestos = {
  id: string
  clave: string
  descripcion: string
}

export type SelectTextProps = {
  name: string
  label: string
  rules?: any
  autoWidth?: boolean
  control?: Control<any>
  disabled?: boolean
  errors?: any
  inputProps?: any
  variant?: any
  menuProps?: any
  index?: number
  fieldArrayName?: string
  onChange?: any
  options?: Array<SelectOptionsProps>
  returnName?: boolean
  register?: any
  native?: boolean
  defaultValue?: any
  getValues?: any
  readOnly?: boolean
}

export type SelectOptionsProps = {
  id: number
  name: string
  row?: any
}

export type VarianteProps = {
  id?: number
  variante: string
  precio: string
  clave: string
}

export type ArticuloCaracteristicasProps = {
  control: Control<ArticuloRequest>
  append: any
  fields: any
  errors: any
  deshabilitado?: boolean
  setValue: any
  getValues: any
  articuloId?: number
  setArticulo?: Dispatch<SetStateAction<ArticuloRequest>>
  variantes?: Array<any>
  remove?: any
  articuloCaracteristicas?: Array<any>
}

export type ArticuloCaracteristicaProps = {
  control: Control<ArticuloRequest>
  deshabilitado: boolean
  errors: any
  index: number
  setValue: any
  getValues: any
  field: any
  articuloId?: number
  setArticulo?: Dispatch<SetStateAction<ArticuloRequest>>
  variantes?: Array<any>
  remove?: any
  articuloCaracteristicas?: Array<any>
  fields?: Array<any>
}

export type InputTagsProps = {
  setValue: any
  name: string
  index: number
  fieldArrayName: string
  label: string
  placeholder: string
  classNames?: string
  disabled: boolean
  errors: any
  getValues: any
  onDelete?: (values?: Array<string>) => void
}

export type ArticuloValidationError = {
  exito: boolean
  error?: string
}

export type ErrorFormulario = {
  exito: boolean
  error?: string
}

export type ArticuloFormularioProps = {
  id?: number
  deshabilitado?: boolean
  articulo?: ArticuloRequest
  guardar?: (vals: ArticuloRequest, callback?: () => void) => void
  inputLabelProps?: any
  error?: ArticuloValidationError
  impuestos: Array<SelectOptionsProps>
  clavesSat: Array<SelectOptionsProps>
  clavesUnidades: Array<SelectOptionsProps>
  setArticulo?: Dispatch<SetStateAction<ArticuloRequest>>
}

export type ImpuestosProps = {
  control: Control<ArticuloRequest>
  append: any
  remove: any
  fields: any
  errors: any
  deshabilitado?: boolean
  impuestos: Array<SelectOptionsProps>
  articuloId?: number
  register?: any
  _impuestos?: Array<any>
  getValues?: any
  setValue?: any
  replace?: any
}

export type VariantesProps = {
  control: Control<ArticuloRequest>
  remove: any
  append: any
  fields: any
  errors: any
  deshabilitado?: boolean
  articuloCaracteristicas?: any
  articuloId?: number
  replace: any
  variantesDefault?: Array<any>
}

export type AutoCompleteProps = {
  name: string
  label: string
  placeholder?: string
  rules?: any
  fullWidth?: boolean
  required?: boolean
  control?: Control<any>
  disabled?: boolean
  errors?: any
  inputProps?: any
  inputLabelProps?: any
  index?: number
  fieldArrayName?: string
  options?: Array<SelectOptionsProps>
  src?: string
  path?: string
  async?: boolean
  freeSolo?: boolean
  srcMapper?: (data: SearchResults<any>) => Array<SelectOptionsProps>
  onChange?: (value: any) => any
  onChangeInput?: (value: any) => any
  entity?: any
  clearOnSelect?: boolean
  catalog?: boolean
  reset?: boolean
  defaultValue?: SelectOptionsProps
  readOnly?: boolean
}

export type InputTextProps = {
  name: string
  label: string
  placeholder?: string
  rules?: any
  fullWidth?: boolean
  required?: boolean
  control?: Control<any>
  disabled?: boolean
  register?: any
  errors?: any
  inputProps?: any
  inputLabelProps?: any
  index?: number
  fieldArrayName?: string
  type?: string
  readOnly?: boolean
}

export type CheckBoxCustomProps = {
  name: string
  label: string
  required?: boolean
  disabled?: boolean
  control?: Control<any>
  errors?: any
  color?: 'primary' | 'secondary' | 'default'
  onChange?: (value: any) => any
  index?: number
  fieldArrayName?: string
  rules?: any
  readOnly?: boolean
}

export type InfoArticuloProps = {
  clavesSat: Array<SelectOptionsProps>
  clavesUnidades: Array<SelectOptionsProps>
  impuestos: Array<SelectOptionsProps>
  articulo?: ArticuloRequest
}

export type InfoFacturaProps = {
  factura: FacturaRequest
  cfdi: Array<SelectOptionsProps>
  folio?: string
}

export type TaxsProps = {
  impuestos: Array<SelectOptionsProps>
  setValue: any
  deshabilitado: boolean
  articuloId?: number
  impuestosDefault?: any
}

export type ImpuestoFacturaDetalle = {
  tasa: number
  tipo: string
  importe?: number
  descripcion: string
  satImpuestoId: number
}

export type FacturaDetalle = {
  id?: number
  nombre: string
  articuloId: number
  cantidad: number | string
  valorUnitario: number | string
  subtotal: number | string
  descuento: number | string
  descuentoImporte: number | string
  descuentoTasa: number | string
  importeTotal: number | string
  subtotalConDescuento: number | string
  impuestos?: Array<ImpuestoFacturaDetalle>
  // totalImpuestos?: number | string
}

export type FacturaRequest = {
  clienteId: number
  claveUsoCFDI: number
  folio: string
  fecha: string
  subtotal: number | string
  total: number | string
  descuento: number | string
  impuestos?: number | string
  conceptos: Array<FacturaDetalle>
  estatus?: string
  direccionDeEnvio?: string
  certificar?: boolean
  rfc?: string
  cliente?: ClienteDeEmpresa
}

export type FacturaFormularioProps = {
  id?: number
  deshabilitado?: boolean
  factura?: FacturaRequest
  guardar?: (vals: FacturaRequest, callback?: () => void) => void
  cfdiCatalog: Array<SelectOptionsProps>
  errorsValidation?: any
  folioSugerido?: string
}

export type ClienteDetalleProps = {
  control: Control<FacturaRequest>
  errors: any
  deshabilitado?: boolean
  setValue?: any
  cfdiCatalog: Array<SelectOptionsProps>
  formReset?: boolean
  clearErrors?: any
  cliente?: SelectOptionsProps
  direccion?: string
}

export type ArticulosDetalleProps = {
  facturaId: number
  // control: Control<FacturaRequest>
  errors: any
  deshabilitado?: boolean
  setValueToForm: any
  articulosDefault: Array<any>
  formReset?: boolean
  clearErrors?: any
}

export type TotalFlotanteProps = {
  conceptos: Array<any>
  setValueToForm: any
  deshabilitado?: boolean
}

export type InputWithListValue = {
  value?: number | string
  valueList?: SelectOptionsProps
}

export type InputWithListProps = {
  label: string
  options: Array<SelectOptionsProps>
  deshabilitado?: boolean
  variant?: 'filled' | 'standard' | 'outlined'
  size?: 'medium' | 'small'
  side?: 'start' | 'end'
  onChangeList?: (value: any) => void
  onChange?: (value: any) => void
  defaultValue?: InputWithListValue
}

export type CalculosProps = {
  subtotalConDescuento?: number
  impuestos?: number
  importeTotal?: number
  descuento?: number
  subtotal?: number
}

export type MenuItemProps = {
  title: string
  action: () => void
  icon?: IconType
  // icon?: JSX.Element
}

export type MenuGenericProps = {
  options: Array<MenuItemProps>
}

export type FacturasFitrosProps = {
  fecha?: string
  folio?: string
  fechaInicio?: string
  fechaFin?: string
}

export type ImpuestoArticuloFactura = {
  id: number
  articuloId: number
  satImpuestoId: number
  impuesto: SatImpuesto
}

export type ImpuestoState = {
  impuestoId?: number
  impuesto: number | string
  impuestoRegistro?: SatImpuesto
}

export type Certificado = {
  certificado: any
  llavePrivada: any
  contrasena: string
  noCertificado: string
}

export type InputFileProps = {
  name: string
  defaultFileName?: string
  defaultValue?: string
  acceptType?: string
  extensions: Array<string>
  maxSize: number
  disabled?: boolean
  setValue: any
  setError: any
  clearErrors: any
  errors: any
}

export type Permiso = {
  id: number
  clave: string
  descripcion: string
  modulo: string
  funcionalidad: string
}

export type RolPermisos = {
  codigo: string
  permisos: Array<Permiso>
}
export type ColaboradorRequest = {
  id?: number
  correoElectronico: string
  nombre: string
  apellido: string
  acceso: string
  status: boolean
  permisos: any
}

export type ColaboradorFormularioProps = {
  id?: number
  guardar: (vals: ColaboradorRequest, permisos: PermisosResponse) => void
  error?: any
  clearError?: () => void
}

export type RadioOptions = {
  value: any
  label: string
}

export type RadioFieldProps = {
  name: string
  options: Array<RadioOptions>
  control: Control<any>
  title?: string
  rules?: any
  defaultValue?: string
  fieldArrayName?: string
  index?: number
  vertical?: boolean
  errors?: any
}

export type SwitchFieldProps = {
  name: string
  control: Control<any>
  label?: string
  title?: string
  rules?: any
  fieldArrayName?: string
  index?: number
  errors?: any
  color?: 'primary' | 'secondary' | 'default'
  defaultValue?: boolean
  setValueToForm: any
}

export type FacturaCreadaRespuesta = {
  resource: number
}

export type DescargaDocs = {
  url: string
  facturasNoDescargadas: Array<{
    facturaId: number
    pdf: any
    xml: any
  }>
}
