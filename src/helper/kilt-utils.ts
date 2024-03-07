/* eslint-disable @typescript-eslint/no-explicit-any */

import type { BN } from '@polkadot/util';
import type { Call } from '@polkadot/types/interfaces';
import type { Codec } from '@polkadot/types/types';
import type { Result } from '@polkadot/types';

import { ApiPromise, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';
import { blake2AsHex } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';

import * as Kilt from '@kiltprotocol/sdk-js';

export const envNames = {
  wsAddress: 'WS_ADDRESS',
  submitterAddress: 'SUBMITTER_ADDRESS',
  didUri: 'DID_URI',
  didMnemonic: 'DID_MNEMONIC',
  authMnemonic: 'KILT_AUTH_MNEMONIC',
  authDerivationPath: 'AUTH_DERIVATION_PATH',
  authKeyType: 'AUTH_KEY_TYPE',
  newAuthMnemonic: 'NEW_AUTH_MNEMONIC',
  newAuthDerivationPath: 'NEW_AUTH_DERIVATION_PATH',
  newAuthKeyType: 'NEW_AUTH_KEY_TYPE',
  attMnemonic: 'ATT_MNEMONIC',
  attDerivationPath: 'ATT_DERIVATION_PATH',
  attKeyType: 'ATT_KEY_TYPE',
  delMnemonic: 'DEL_MNEMONIC',
  delDerivationPath: 'DEL_DERIVATION_PATH',
  delKeyType: 'DEL_KEY_TYPE',
  encodedCall: 'ENCODED_CALL',
  consumerWsAddress: 'CONSUMER_WS_ADDRESS',
  providerWsAddress: 'PROVIDER_WS_ADDRESS',
  relayWsAddress: 'RELAY_WS_ADDRESS',
  verificationMethod: 'VERIFICATION_METHOD',
  identityDetailsType: 'IDENTITY_DETAILS',
  accountIdType: 'ACCOUNT_ID',
  blockNumberType: 'BLOCK_NUMBER',
  includeWeb3Name: 'INCLUDE_WEB3NAME',
  dipProofVersion: 'DIP_PROOF_VERSION',
};

type Defaults = {
  wsAddress: string;
  authKeyType: Kilt.KeyringPair['type'];
  attKeyType: Kilt.KeyringPair['type'];
  delKeyType: Kilt.KeyringPair['type'];
  identityDetailsType: string;
  accountIdType: string;
  blockNumberType: string;
  includeWeb3Name: boolean;
  dipProofVersion: number;
};

export const defaults: Defaults = {
  wsAddress: 'wss://spiritnet.kilt.io',
  authKeyType: 'sr25519',
  attKeyType: 'sr25519',
  delKeyType: 'sr25519',
  identityDetailsType: 'Option<u128>',
  accountIdType: 'AccountId32',
  blockNumberType: 'u64',
  includeWeb3Name: false,
  dipProofVersion: 0,
};

export function getKeypairSigningCallback(
  keyUri: Kilt.DidResourceUri,
  signingKeypair: Kilt.KiltKeyringPair,
): Kilt.SignCallback {
  return async ({ data }) => ({
    signature: signingKeypair.sign(data),
    keyType: signingKeypair.type,
    keyUri,
  });
}

export function getKeypairTxSigningCallback(signingKeypair: Kilt.KiltKeyringPair): Kilt.Did.GetStoreTxSignCallback {
  return async ({ data }) => ({
    signature: signingKeypair.sign(data),
    keyType: signingKeypair.type,
  });
}

export function getPaymentAccountKey(): Kilt.KiltKeyringPair {
  const authKeyMnemonic = process.env.KILT_PAYMENT_ACCOUNT_MNEMONIC!;
  console.log(`authKeyMnemonic: ${authKeyMnemonic}`);
  const keyring = new Kilt.Utils.Keyring({
    ss58Format: 38,
    type: 'sr25519',
  });
  console.log('keyring keyring', keyring);
  const kr = keyring.addFromMnemonic(authKeyMnemonic) as Kilt.KiltKeyringPair;
  console.log('KiltKeyringPair', kr);
  return kr;
}

const validValues: Set<Kilt.VerificationKeyRelationship> = new Set([
  'authentication' as Kilt.VerificationKeyRelationship,
  'assertionMethod' as Kilt.VerificationKeyRelationship,
  'capabilityDelegation' as Kilt.VerificationKeyRelationship,
]);
export function parseVerificationMethod(): Kilt.VerificationKeyRelationship {
  const verificationMethod = process.env[envNames.verificationMethod];
  if (verificationMethod === undefined) {
    throw new Error(`No ${envNames.verificationMethod} env variable specified.`);
  }
  const castedVerificationMethod = verificationMethod as Kilt.VerificationKeyRelationship;
  if (validValues.has(castedVerificationMethod)) {
    return castedVerificationMethod;
  } else {
    throw new Error(
      `Provided value for ${envNames.verificationMethod} does not match any of the expected values: ${validValues}.`,
    );
  }
}

export async function generateSiblingDipTx(
  relayApi: ApiPromise,
  providerApi: ApiPromise,
  consumerApi: ApiPromise,
  did: Kilt.DidUri,
  call: Call,
  submitterAccount: KeyringPair['address'],
  keyId: Kilt.DidVerificationKey['id'],
  didKeyRelationship: Kilt.VerificationKeyRelationship,
  includeWeb3Name: boolean,
  version: number,
  sign: Kilt.SignExtrinsicCallback,
): Promise<Kilt.SubmittableExtrinsic> {
  const signature = await generateDipTxSignature(consumerApi, did, call, submitterAccount, didKeyRelationship, sign);

  const providerChainId = await providerApi.query.parachainInfo.parachainId();
  console.log(`Provider chain has para ID = ${providerChainId.toHuman()}.`);
  const providerFinalizedBlockHash = await providerApi.rpc.chain.getFinalizedHead();
  const providerFinalizedBlockNumber = await providerApi.rpc.chain
    .getHeader(providerFinalizedBlockHash)
    .then((h) => h.number);
  console.log(
    `DIP action targeting the last finalized identity provider block with hash:
    ${providerFinalizedBlockHash}
    and number
    ${providerFinalizedBlockNumber}.`,
  );
  const relayParentBlockHeight = await providerApi
    .at(providerFinalizedBlockHash)
    .then((api) => api.query.parachainSystem.lastRelayChainBlockNumber());
  const relayParentBlockHash = await relayApi.rpc.chain.getBlockHash(relayParentBlockHeight);
  console.log(
    `Relay chain block the identity provider block was anchored to:
    ${relayParentBlockHeight.toHuman()}
    with hash
    ${relayParentBlockHash.toHuman()}.`,
  );

  const { proof: relayProof } = await relayApi.rpc.state.getReadProof(
    [relayApi.query.paras.heads.key(providerChainId)],
    relayParentBlockHash,
  );

  // Proof of commitment must be generated with the state root at the block before the last one finalized.
  const previousBlockHash = await providerApi.rpc.chain.getBlockHash(providerFinalizedBlockNumber.toNumber() - 1);
  console.log(`Using previous provider block hash for the state proof generation: ${previousBlockHash.toHex()}.`);
  const { proof: paraStateProof } = await providerApi.rpc.state.getReadProof(
    [providerApi.query.dipProvider.identityCommitments.key(Kilt.Did.toChain(did), version)],
    previousBlockHash,
  );
  console.log(`DIP proof v${version} generated for the DID key ${keyId.substring(1)} (${didKeyRelationship}).`);
  const dipProof =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (
      (await providerApi.call.dipProvider.generateProof({
        identifier: Kilt.Did.toChain(did),
        version,
        keys: [keyId.substring(1)],
        accounts: [],
        shouldIncludeWeb3Name: includeWeb3Name,
        // TODO: Improve this line below
      })) as Result<Codec, Codec>
    ).asOk as any;
  providerApi.disconnect();

  const extrinsic = consumerApi.tx.dipConsumer.dispatchAs(
    Kilt.Did.toChain(did),
    {
      [`V${version}`]: {
        paraStateRoot: {
          relayBlockHeight: relayParentBlockHeight,
          proof: relayProof,
        },
        dipIdentityCommitment: paraStateProof,
        did: {
          leaves: {
            blinded: dipProof.proof.blinded,
            revealed: dipProof.proof.revealed,
          },
          signature: {
            signature: signature[0],
            blockNumber: signature[1],
          },
        },
      },
    },
    call,
  );

  return extrinsic;
}

export async function generateParentDipTx(
  relayApi: ApiPromise,
  providerApi: ApiPromise,
  did: Kilt.DidUri,
  call: Call,
  submitterAccount: KeyringPair['address'],
  keyId: Kilt.DidVerificationKey['id'],
  didKeyRelationship: Kilt.VerificationKeyRelationship,
  includeWeb3Name: boolean,
  version: number,
  sign: Kilt.SignExtrinsicCallback,
): Promise<Kilt.SubmittableExtrinsic> {
  const signature = await generateDipTxSignature(relayApi, did, call, submitterAccount, didKeyRelationship, sign);

  const providerChainId = await providerApi.query.parachainInfo.parachainId();
  console.log(`Provider chain has para ID = ${providerChainId.toHuman()}.`);
  const providerFinalizedBlockHash = await providerApi.rpc.chain.getFinalizedHead();
  const providerFinalizedBlockNumber = await providerApi.rpc.chain
    .getHeader(providerFinalizedBlockHash)
    .then((h) => h.number);
  console.log(
    `DIP action targeting the last finalized identity provider block with hash:
    ${providerFinalizedBlockHash}
    and number
    ${providerFinalizedBlockNumber}.`,
  );
  const relayParentBlockHeight = await providerApi
    .at(providerFinalizedBlockHash)
    .then((api) => api.query.parachainSystem.lastRelayChainBlockNumber());
  const relayParentBlockHash = await relayApi.rpc.chain.getBlockHash(relayParentBlockHeight);
  console.log(
    `Relay chain block the identity provider block was anchored to:
    ${relayParentBlockHeight.toHuman()}
    with hash
    ${relayParentBlockHash.toHuman()}.`,
  );

  const { proof: relayProof } = await relayApi.rpc.state.getReadProof(
    [relayApi.query.paras.heads.key(providerChainId)],
    relayParentBlockHash,
  );

  const header = await relayApi.rpc.chain.getHeader(relayParentBlockHash);
  console.log(
    `Header for the relay at block ${relayParentBlockHeight} (${relayParentBlockHash}): ${JSON.stringify(
      header,
      null,
      2,
    )}`,
  );

  // Proof of commitment must be generated with the state root at the block before the last one finalized.
  const previousBlockHash = await providerApi.rpc.chain.getBlockHash(providerFinalizedBlockNumber.toNumber() - 1);
  console.log(`Using previous provider block hash for the state proof generation: ${previousBlockHash.toHex()}.`);
  const { proof: paraStateProof } = await providerApi.rpc.state.getReadProof(
    [providerApi.query.dipProvider.identityCommitments.key(Kilt.Did.toChain(did), version)],
    previousBlockHash,
  );
  console.log(`DIP proof v${version} generated for the DID key ${keyId.substring(1)} (${didKeyRelationship}).`);
  const dipProof =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (
      (await providerApi.call.dipProvider.generateProof({
        identifier: Kilt.Did.toChain(did),
        version,
        keys: [keyId.substring(1)],
        accounts: [],
        shouldIncludeWeb3Name: includeWeb3Name,
        // TODO: Improve this line below
      })) as Result<Codec, Codec>
    ).asOk as any;
  providerApi.disconnect();

  const extrinsic = relayApi.tx.dipConsumer.dispatchAs(
    Kilt.Did.toChain(did),
    {
      [`V${version}`]: {
        paraStateRoot: {
          relayBlockHeight: relayParentBlockHeight,
          proof: relayProof,
        },
        header: {
          ...header.toJSON(),
        },
        dipIdentityCommitment: paraStateProof,
        did: {
          leaves: {
            blinded: dipProof.proof.blinded,
            revealed: dipProof.proof.revealed,
          },
          signature: {
            signature: signature[0],
            blockNumber: signature[1],
          },
        },
      },
    },
    call,
  );

  return extrinsic;
}

async function generateDipTxSignature(
  api: ApiPromise,
  did: Kilt.DidUri,
  call: Call,
  submitterAccount: KeyringPair['address'],
  didKeyRelationship: Kilt.VerificationKeyRelationship,
  sign: Kilt.SignExtrinsicCallback,
): Promise<[Kilt.Did.EncodedSignature, BN]> {
  const isDipCapable = api.tx.dipConsumer.dispatchAs !== undefined;
  if (!isDipCapable) {
    throw new Error(`The target chain at does not seem to support DIP.`);
  }
  const blockNumber = await api.query.system.number();
  console.log(`DIP signature targeting block number: ${blockNumber.toHuman()}`);
  const genesisHash = await api.query.system.blockHash(0);
  console.log(`DIP consumer genesis hash: ${genesisHash.toHuman()}`);
  const identityDetailsType = process.env[envNames.identityDetailsType] ?? defaults.identityDetailsType;
  const identityDetails =
    (await api.query.dipConsumer.identityEntries(
      Kilt.Did.toChain(did),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    )) || api.createType(identityDetailsType, null);
  console.log(
    `DIP subject identity details on consumer chain: ${JSON.stringify(
      identityDetails,
      null,
      2,
    )} with runtime type "${identityDetailsType}"`,
  );
  const accountIdType = process.env[envNames.accountIdType] ?? defaults.accountIdType;
  console.log(`DIP AccountId runtime type: "${accountIdType}"`);
  const blockNumberType = process.env[envNames.blockNumberType] ?? defaults.blockNumberType;
  console.log(`Block number runtime type: "${blockNumberType}"`);
  const signaturePayload = api
    .createType(`(Call, ${identityDetailsType}, ${accountIdType}, ${blockNumberType}, Hash)`, [
      call,
      identityDetails,
      submitterAccount,
      blockNumber,
      genesisHash,
    ])
    .toU8a();
  console.log(`Encoded payload for signing: ${u8aToHex(signaturePayload)}`);
  const signature = await sign({
    data: signaturePayload,
    keyRelationship: didKeyRelationship,
    did,
  });
  return [
    {
      [signature.keyType]: signature.signature,
    } as Kilt.Did.EncodedSignature,
    blockNumber.toBn(),
  ];
}

export function hexifyDipSignature(signature: Kilt.Did.EncodedSignature) {
  const [signatureType, byteSignature] = Object.entries(signature)[0];
  const hexifiedSignature = {
    [signatureType]: u8aToHex(byteSignature),
  };
  return hexifiedSignature;
}

export function computeDidKeyId(
  api: ApiPromise,
  publicKey: Kilt.KeyringPair['publicKey'],
  keyType: Kilt.DidKey['type'],
): Kilt.DidKey['id'] {
  const didEncodedKey = api.createType('DidDidDetailsDidPublicKey', {
    publicVerificationKey: {
      [keyType]: publicKey,
    },
  });
  return `#${blake2AsHex(didEncodedKey.toU8a(), 256)}`;
}

export function generatePolkadotJSLink(wsAddress: string, encodedExtrinsic: `0x${string}`): string {
  return `https://polkadot.js.org/apps/?rpc=${wsAddress}#/extrinsics/decode/${encodedExtrinsic}`;
}
