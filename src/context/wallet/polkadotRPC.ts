import { SafeEventEmitterProvider } from '@web3auth/base';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import type { Registry } from '@polkadot/types/types';
import { formatBalance } from '@polkadot/util';
import { encodeAddress, decodeAddress } from '@polkadot/keyring';

export default class PolkadotRPC {
  private provider: SafeEventEmitterProvider;

  constructor(provider: SafeEventEmitterProvider) {
    this.provider = provider;
  }

  makeClient = async (): Promise<ApiPromise> => {
    console.log('Establishing connection to Polkadot RPC...');
    const rpcUrl = process.env.POLKADOT_RPC_URL || 'wss://rpc.testnet.metaquity.xyz';
    const provider = new WsProvider(rpcUrl);
    const api = await ApiPromise.create({ provider });
    const resp = await api.isReady;
    console.log('Polkadot RPC is ready', resp);
    return api;
  };

  getPolkadotKeyPair = async (): Promise<any> => {
    await cryptoWaitReady();
    const privateKey = (await this.provider.request({
      method: 'private_key',
    })) as string;
    const keyring = new Keyring({
      ss58Format: process.env.NEXT_PUBLIC_SS58FORMAT as unknown as number,
      type: 'sr25519',
    });
    const keyPair = keyring.addFromUri('0x' + privateKey);
    return keyPair;
  };

  getAccounts = async (): Promise<any> => {
    const keyPair = await this.getPolkadotKeyPair();
    return keyPair.address;
  };

  getKiltAccounts = async (): Promise<any> => {
    const keyPair = await this.getPolkadotKeyPair();
    const address38 = encodeAddress(decodeAddress(keyPair.address), 38);
    return address38;
  };

  getBalance = async (): Promise<any> => {
    const keyPair = await this.getPolkadotKeyPair();
    const api = await this.makeClient();
    const format = this.getFormat(api.registry, 0);
    const json = await api.derive.balances?.all(keyPair.address);
    const [prefix, postfix] = formatBalance(json.freeBalance, {
      decimals: format[0],
      forceUnit: '-',
      withSi: false,
    }).split('.');
    return { prefix, postfix, symbol: format[1] };
  };

  getUserTransactionHistory = async (): Promise<any> => {
    const api = await this.makeClient();
    const keyPair = await this.getPolkadotKeyPair();
  };

  transferBalance = async (accountID: string, value: any): Promise<any> => {
    const keyPair = await this.getPolkadotKeyPair();
    const api = await this.makeClient();
    await api.tx.balances.transfer(keyPair.address, 121212121211212).signAndSend(keyPair);
    this.getFormat(api.registry, 0);
    const info = await api.tx.balances.transfer(keyPair.address, 121212121211212).paymentInfo(keyPair.address);
    console.log(`
    class=${info.class.toString()},
    weight=${info.weight.toString()},
    partialFee=${info.partialFee.toHuman()}
  `);
  };

  getFormat(registry: Registry, formatIndex = 0): [number, string] {
    const decimals = registry.chainDecimals;
    const tokens = registry.chainTokens;

    return [
      formatIndex < decimals.length ? decimals[formatIndex] : decimals[0],
      formatIndex < tokens.length ? tokens[formatIndex] : tokens[1],
    ];
  }

  async createNFT() {
    const keyPair = await this.getPolkadotKeyPair();
    const api = await this.makeClient();
    return new Promise((resolve, _) => {
      api.tx.nfts.create(keyPair.address, {}).signAndSend(keyPair, async (event: any) => {
        const result = event.toHuman();
        if (result.status.InBlock) {
          api.tx.nfts
            .mint(result.events[3].event.data.collection, 1, keyPair.address, {})
            .signAndSend(keyPair, async (mintEvent: any) => {
              const mintResult = mintEvent.toHuman();
              if (mintResult.status.InBlock) {
                console.log('NFT successfully minted:', mintResult.status.InBlock);
                resolve({
                  nftBlockMint: mintResult.status.InBlock,
                  nftCollectionID: result.events[3].event.data.collection,
                  nftItem: 1,
                  nftOwner: keyPair.address,
                });
              }
            });
        }
      });
    });
  }

  async fractionalizeNFT(collectionID: number, itemID: number, assetID: number, factional: number) {
    const keyPair = await this.getPolkadotKeyPair();
    const api = await this.makeClient();
    return new Promise((resolve, _) => {
      api.tx.nftFractionalization
        .fractionalize(collectionID, itemID, assetID, keyPair.address, 100)
        .signAndSend(keyPair, async (event: any) => {
          const result = event.toHuman();
          if (result.status.InBlock) {
            console.log('Fractionalized:', result.status.InBlock);
            resolve({
              nftCollectionID: collectionID,
              nftItem: itemID,
              fractionalizationAssetID: assetID,
              fractionalizationBlockMint: result.status.InBlock,
              fractionalization: factional,
            });
          }
        });
    });
  }
}
