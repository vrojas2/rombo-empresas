import getConfig from 'next/config'
import { useRef, useEffect } from 'react'
import { isValidArray } from '@rombomx/ui-commons'

const { publicRuntimeConfig } = getConfig()
const { cookiesSecure, jwtDefaultExpiration } = publicRuntimeConfig

const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

const dateTimeFormat = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: 'numeric',
  day: '2-digit',
})

/**
 * Checks if a string is empty
 * @param value <string>
 * @returns res <boolean>
 */
export const isEmptyString = (value: string): boolean =>
  !(typeof value === 'string' && value.length > 0)

/**
 * Assigns a cookie to browser
 * @params ctxCookie: any
 * @params name: string
 * @params value: string
 * @params secondsToExpire: number
 */
export const setCookie = (
  ctxCookie: any,
  name: string,
  value: string,
  secondsToExpire = Number(jwtDefaultExpiration),
) => {
  const d = new Date()
  d.setTime(d.getTime() + secondsToExpire * 1000)

  ctxCookie.cookie = `${name}=${encodeURIComponent(
    value,
  )}; expires=${d.toUTCString()}; path=/; SameSite=${
    cookiesSecure === 'true' ? 'None' : 'Strict'
  }; ${cookiesSecure === 'true' ? 'Secure' : ''}`
}

/**
 * Retrieve a cookie from browser
 * @params ctxCookie: any
 * @params cname: string
 */
export const getCookie = (ctxCookie: any, cname: string) => {
  const name = `${cname}=`

  const decodedCookie = decodeURIComponent(ctxCookie.cookie)

  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return null
}

/**
 * Deletes a cookie from browser
 * @param ctxCookie: any
 * @param name: string
 */
export const deleteCookie = (ctxCookie: any, name: string): void => {
  ctxCookie.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;`
}

/**
 * Generates the variants from variants configuration
 * @param variantsOptions [{caracteristica: 'v1, valor:['a','b']},{caracteristica: 'v2, valor:['1','2']}]
 * @param separator
 * @return variants ['a/1','a/2','b/1','b/2']
 */
export const getVariantsCombination = (variantsOptions, separator = '/') => {
  if (isValidArray(variantsOptions)) {
    const varConfigs = variantsOptions.map((vG) => vG.valor)
    const variants = varConfigs.reduce((current, next) => {
      const variantNames = []
      if (isValidArray(current) && isValidArray(next)) {
        current.map((i) => {
          next.map((j) => {
            variantNames.push(`${i}${separator}${j}`)
          })
        })
      } else {
        current.map((c) => variantNames.push(`${c}`))
      }
      return variantNames
    })
    return variants
  }
}

/**
 * Customize hook for gets a previous ref value of a variable
 * @param value
 * @returns preValue
 */
export const usePreviousValue = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

/**
 * Function for format an amount currency
 * @param number
 * @returns number | undefined
 */
export const formatCurrency = (number: number): string | undefined => {
  if (Number.isNaN(number)) {
    return
  }

  return formatter.format(number)
}

/**
 * Function for format an date
 * @param date
 * @param divider
 * @returns string | undefined
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const formatDate = (
  date: string | Date | number | undefined,
  divider = '/',
): string | undefined => {
  if (!date) {
    return
  }

  if (date instanceof Date) {
    const format = dateTimeFormat.formatToParts(date)
    return `${format[0].value}${divider}${format[2].value}${divider}${format[4].value}`
  }

  if (typeof date === 'string') {
    const dateAux = new Date(`${date} 00:00:00`)
    const format = dateTimeFormat.formatToParts(dateAux)
    return `${format[0].value}${divider}${format[2].value}${divider}${format[4].value}`
  }

  if (typeof date === 'number') {
    const format = dateTimeFormat.formatToParts(new Date(date))
    return `${format[0].value}${divider}${format[2].value}${divider}${format[4].value}`
  }

  return undefined
}

/**
 * @Description Forza la descarga de un archivo desde el navegador
 * @params url: string
 * @returns void
 */
export const descargarArchivoDesdeURL = (url: string) => {
  const link = document.createElement('a')
  link.download = 'descarga'
  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
