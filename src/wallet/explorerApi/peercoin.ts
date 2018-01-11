import { getJSON, stringifyQuery, Satoshis, normalizeSatoshis, Wallet, walletMeta } from './common'

namespace ApiCalls {
  export type Coind = 
    | 'getdifficulty'
    | 'connectioncount'
    | 'getblockcount'
    | 'getrawtransaction'
    | 'sendrawtransaction'

  export type Extended = 
    | 'getaddress'
    | 'listunspent'
    | 'txinfo'
    | 'getbalance'

}
type ApiCalls = ApiCalls.Coind | ApiCalls.Extended

namespace GetRawTransaction {
  export type VOut = {
    value: number,
    n: number,
    scriptPubKey: any
  }
  export type Output = {
    script: string,
    amount: Satoshis
  }

  export type Response = {
    txid: string,
    time: number,
    confirmations: number,
    vout: Array<VOut>,
    vin: Array<any>,
    blockhash: string,
    blocktime: number
  }

}

namespace TxInfo {
  export type Input = {
    addresses: string,
    txid?: string, 
    amount: Satoshis
  }
  export type Output = {
    script: string,
    amount: Satoshis
  }

  export type Response = {
    hash: string,
    block: number,
    timestamp: number,
    total: Satoshis,
    inputs: Array<Input>,
    outputs: Array<Output>,
  }

}

namespace GetAddress {
  type TxReference = string
  export type Transaction = {
    addresses: TxReference,
    type: string
  }
  export type Response = {
    address: string,
    sent: number,
    received: number,
    balance: number,
    last_txns: Array<Transaction>,
  }
}

namespace normalize {

  export const satoshis = normalizeSatoshis

  export function transactions(balance: number, txs: Array<GetRawTransaction.Response>){
    let nTransactions: Array<Wallet.Transaction> = []
    for (let { txid: id, confirmations, time, vout } of txs ){
      let amount = vout.reduce((a, { value }) => a + value, 0)
      nTransactions.push({
        id,
        confirmations,
        amount,
        balance,
        timestamp: new Date(time)
      })
      balance -= amount
    }
    return nTransactions
  }

  export function wallet({ last_txns, ...wallet }: GetAddress.Response, txs: Array<GetRawTransaction.Response>): Wallet {
    return Object.assign(
      walletMeta(),
      wallet,
      {
        transactions: normalize.transactions(wallet.balance, txs),
        totalTransactions: txs.length
      }
    )
  }
}


class PeercoinExplorer {
  explorerUrl = 'https://explorer.peercoin.net'
  apiRequest<T = any>(call: ApiCalls.Coind, query: object, errorMessage = `PeercoinExplorer.ext.${call} request returned empty`){
    return getJSON<T>(`${this.explorerUrl}/api/${call}?${stringifyQuery(query)}`, errorMessage)
  }
  extendedRequest<T = any>(call: ApiCalls.Extended, param: string, errorMessage = `PeercoinExplorer.ext.${call} request returned empty`){
    return getJSON<T>(`${this.explorerUrl}/ext/${[ call, param ].join('/')}`, errorMessage)
  }
  getBalance = async (address: string) => {
    let balance = await this.extendedRequest('getbalance', address)
    return Number(balance)
  }

  listUnspent = async (address: string) => {
    let { unspent_outputs } = await this.extendedRequest('listunspent', address)
    return unspent_outputs
  }

  getRawTransaciton = (txid: string) => this.apiRequest<GetRawTransaction.Response>('getrawtransaction', { txid })
  transactionInfo = (id: string) => this.extendedRequest('txinfo', id)
  getAddress = (address: string) => this.extendedRequest<GetAddress.Response>('getaddress', address)

  wallet = async (address: string) => {
    let resp = await this.getAddress(address)
    let transactions = await Promise.all(
      resp.last_txns.map(txn => this.getRawTransaciton(txn.addresses))
    )
    return normalize.wallet(resp, transactions)
  }

} 

export default new PeercoinExplorer()