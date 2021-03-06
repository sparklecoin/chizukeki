const deckSpawnTagHashes = {
  'MAINNET_PRODUCTION': 'SatuPf4wo1JxrWFK62q7Jm8ZwYTDvXMT1n',
  'MAINNET_TESTING': 'SinPAWasqVVcoEcw7ymSH5PSFNZNZa2mkm',
  'TESTNET_PRODUCTION': 'tHeAnCNaQarB92WpCAHC8kRs79FhJvcjgA',
  'TESTNET_TESTING': 'tTbbxyd6o9qTsUoYChay6aYtzVpreAiGHV',
}

function getDeckSpawnTagHash(network: 'MAINNET' | 'TESTNET', mode: 'PRODUCTION' | 'TESTING'): string {
  return deckSpawnTagHashes[`${network}_${mode}`]
}

namespace Configuration {
  export type Network = 'MAINNET' | 'TESTNET'
  export type DeploymentMode = 'PRODUCTION' | 'TESTING'

  //todo io-ts
  export function validator<T>(name: string, options: Array<T>, defaultValue?: T) {
    function is(u: any): u is T {
      //todo I have no idea why includes is unrecognized without this casting, as it's recognized elsewhere
      return (options as any).includes(u)
    }
    let invalidMessage = u => `invalid option for ${name} supplied: ${u}`
    function from(u: any) {
      if(is(u)){
        return u
      }
      if (defaultValue !== undefined) {
        if (u !== undefined) {
          console.warn(`${invalidMessage(u)}. Using default ${defaultValue}`)
        }
        return defaultValue
      }
      throw Error(invalidMessage(u))
    }
    function fromEnv(u: any = process.env[name.toUpperCase()]) {
      if(is(u)){
        return u
      }
      if (defaultValue !== undefined) {
        if (u !== undefined) {
          console.warn(`${invalidMessage(u)}. Using default ${defaultValue}`)
        }
        return defaultValue
      }
      throw Error(invalidMessage(u))
    }
    return { from, fromEnv }
  }

  export const network = validator<Network>('network', [ 'MAINNET', 'TESTNET' ], 'TESTNET')
  export const deploymentMode = validator<DeploymentMode>('network', [ 'PRODUCTION', 'TESTING' ], 'PRODUCTION')

  type FullConfiguration = {
    NETWORK: "MAINNET" | "TESTNET"
    DEPLOYMENT_MODE: "PRODUCTION" | "TESTING"
    ASSETS: {
      deckSpawnTagHash: string
      minTagFee: number
      txnFee: number
    }
  }

  var cachedFromEnv: FullConfiguration
  export function fromEnv(){
    if(cachedFromEnv){
      return cachedFromEnv
    }
    let NETWORK = network.fromEnv()
    let DEPLOYMENT_MODE = deploymentMode.fromEnv()
    let ASSETS = {
      deckSpawnTagHash: getDeckSpawnTagHash(NETWORK, DEPLOYMENT_MODE),
      minTagFee: 0.01,
      txnFee: 0.01
    }
    cachedFromEnv = { NETWORK, DEPLOYMENT_MODE, ASSETS }
    return cachedFromEnv
  }
}

export default Configuration
