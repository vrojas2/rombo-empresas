/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
//La idea es eventualmente implementar una solución más robusta que envie lo que sea necesario al servidro

export const log = (message?: any, ...optionalParams: any[]): void =>
  console.log(message, optionalParams)
export const debug = (message?: any, ...optionalParams: any[]): void =>
  console.debug('%cDEBUG:', 'color: #e09200;', message, optionalParams)
export const error = (message?: any, ...optionalParams: any[]): void =>
  console.error(message, optionalParams)
export const info = (message?: any, ...optionalParams: any[]): void =>
  console.info(message, optionalParams)
export const warn = (message?: any, ...optionalParams: any[]): void =>
  console.warn(message, optionalParams)
