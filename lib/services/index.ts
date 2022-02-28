import { Auth } from 'aws-amplify'
import axios, { Method } from 'axios'
import getConfig from 'next/config'
import { SearchResults } from '@rombomx/models'
import { isValidArray, logger } from '@rombomx/ui-commons'
import { debug } from './logger'

const { publicRuntimeConfig } = getConfig()

const { baseUrl } = publicRuntimeConfig

export const http = axios.create()
export const httpWithOutCredentials = axios.create()

http.interceptors.request.use(async (config) => {
  try {
    const jwt = (await Auth.currentSession()).getIdToken().getJwtToken()
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${jwt}`
  } catch (e) {
    logger.warn('No current user', e)
  }
  return config
})

type Search = {
  name: string
  value: string
}

type SearchProps = {
  path?: string
  page?: number
  pageSize?: number
  sortField?: string
  desc?: boolean
  query?: string
  autocomplete?: boolean
  unauthenticated?: boolean
  parameters?: { [key: string]: string }
}
export const searchItems = async <T>(
  resource: string,
  props: SearchProps = {
    page: 1,
    pageSize: 25,
    path: '',
    unauthenticated: false,
  },
): Promise<SearchResults<T>> => {
  const {
    page,
    pageSize,
    path,
    sortField,
    desc = false,
    query,
    autocomplete,
    unauthenticated = false,
    parameters,
  } = props
  const axiosInstance = unauthenticated ? axios : http

  const params = {
    page,
    size: pageSize,
    q: query,
    sort: sortField ? `${sortField}:${desc ? 'desc' : 'asc'}` : undefined,
    autocomplete,
  }

  if (parameters) {
    const keys = Object.keys(parameters)
    if (isValidArray(keys)) {
      keys.map((key) => {
        params[key] = parameters[key]
      })
    }
  }

  const { data } = await axiosInstance.get<SearchResults<T>>(createResourceUrl(resource, path), {
    params,
  })
  return data
}

export const request = <T>(
  method: Method,
  resource: string,
  path: string,
  body?: any,
  unauthenticated = false,
  noDomain = false,
): Promise<T> => {
  const axiosInstance = unauthenticated ? axios : http
  let url = createResourceUrl(resource, path)
  if (noDomain) {
    url = `${resource}${path}`
  }
  return axiosInstance
    .request<T>({
      method,
      url,
    })
    .then(({ data }) => data)
}

export const execute = async <T>(
  resource: string,
  path = '',
  body?: any,
  noDomain = false,
): Promise<T> => {
  let url = createResourceUrl(resource, path)
  if (noDomain) {
    url = `${resource}${path}`
  }
  const { data } = await http.post<T>(url, body)
  return data
}

export const putFile = async (
  resource: string,
  path = '',
  file: File,
  method: 'post' | 'get' = 'post',
): Promise<{ key: string; fileUploadPromise: Promise<any> }> => {
  let promiseSignedUrl
  if (method === 'get') {
    promiseSignedUrl = http.get<{ url: string; key: string }>(createResourceUrl(resource, path))
  } else {
    promiseSignedUrl = http.post<{ url: string; key: string }>(createResourceUrl(resource, path))
  }
  const {
    data: { url, key },
  } = await promiseSignedUrl

  debug('subiendo archivo')

  //No esperamos esta promesa. Devolvemos el key antes de que se ejecute
  const fileUploadPromise = axios({
    url,
    method: 'put',
    data: await file.arrayBuffer(),
    headers: {
      'Content-Type': file.type,
    },
  })

  return { key, fileUploadPromise }
}

export const getEntityRecord = async <T>(resource: string, path: string): Promise<T> => {
  const { data } = await http.get<T>(createResourceUrl(resource, path))
  return data
}

export const getEntity = getEntityRecord

export const createItem = async <T>(
  body: T,
  resource: string,
  path = '',
  noDomain = false,
): Promise<string | number | T> => {
  let url = createResourceUrl(resource, path)
  if (noDomain) {
    url = `${resource}/${path}`
  }
  const { data } = await http.post<T>(url, body)
  console.log('Este es el resultado', data)
  return data
}

export const updateItem = async <T>(
  body: T,
  resource: string,
  path = '',
): Promise<string | number> => {
  const { data } = await http.patch(createResourceUrl(resource, path), body)
  console.log('Este es el resultado', data)
  return `listo ${data}`
}

export const deleteItem = async <T>(resource: string, path = ''): Promise<string | number> => {
  const { data } = await http.delete(createResourceUrl(resource, path))
  return `listo ${data}`
}

export const deleteItems = async <T>(
  body: T,
  resource: string,
  path = '',
): Promise<string | number | any> => {
  const { data } = await http.post(createResourceUrl(resource, path), body)
  return data
}

const createResourceUrl = (resource: string, path = '') => `https://${resource}.${baseUrl}/${path}`
