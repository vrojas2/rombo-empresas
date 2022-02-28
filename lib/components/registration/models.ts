export interface AdministradorFormDTO {
  nombre: string
  correo: string
  numeroTelefonico: string
  contrasena: string
}

export interface EmpresaFormDTO {
  nombre: string
  giroComercialId: number
  nombreGiroComercial?: string
}
