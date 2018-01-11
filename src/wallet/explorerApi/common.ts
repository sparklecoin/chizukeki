
namespace Wallet {
  export type Transaction = {
    balance: number,
    amount: number,
    id: string,
    confirmations: number,
    timestamp: Date,
  }
}

type Wallet = {
  _meta: {
    created: Date,
    updated: Date,
  },
  received: number,
  sent: number,
  balance: number,
  totalTransactions: number,
  transactions: Array<Wallet.Transaction>
}

export function walletMeta() {
  let created = new Date()
  return {
    _meta: {
      created,
      updated: created,
    }
  }
}

export type Satoshis = number

export function normalizeSatoshis(amountInSatoshis: Satoshis) {
  return amountInSatoshis / 100000000.0
}

export function stringifyQuery(query: object) {
  return Object.keys(query).reduce((q, key) => `${q}&${key}=${query[key]}`, '')
}

export async function getJSON<T = any>(url: string, emptyErrorMessage?: void | string) {
  let response = await fetch(url)
  let body: T = await response.json()
  if (body !== undefined && body !== null) {
    return body
  } else {
    throw Error(emptyErrorMessage || `getJSON('${url}') failed`)
  }
}

export { Wallet }