'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/src/layout';
import * as Kilt from '@kiltprotocol/sdk-js';
import * as utils from './kilt-utils';
import { useWeb3Auth } from '@/src/hooks/useWeb3Auth';
import PolkadotRPC from '@/src/context/wallet/polkadotRPC';
import { encodeAddress, decodeAddress } from '@polkadot/keyring';

const Transactions: React.FC = () => {
  // const { web3auth, provider } = useWeb3Auth();
  // const [polkadotKeyPair, setPolkadotKeyPair] = useState();

  // useEffect(() => {
  //   const polkaLoad = async () => {
  //     // if (!web3auth) {
  //     //   console.log('web3auth not initialized yet');
  //     //   return;
  //     // }
  //     await web3auth?.initModal();
  //     if (web3auth?.provider) {
  //       const rpc = new PolkadotRPC(web3auth.provider);
  //     }
  //   };

  //   polkaLoad();
  // }, [web3auth, provider]);

  const { web3auth, provider } = useWeb3Auth();
  const [polkadotKeyPair, setPolkadotKeyPair] = useState();

  useEffect(() => {
    const polkaLoad = async () => {
      if (!web3auth) {
        console.log('web3auth not initialized yet');
        return;
      }
      await web3auth.initModal();
      if (web3auth.provider) {
        const rpc = new PolkadotRPC(web3auth.provider);
        const balance = await rpc.getBalance();
        console.log(balance);
        const keypair = await rpc.getPolkadotKeyPair();
        console.log(keypair);
        setPolkadotKeyPair(keypair);
      }
    };

    polkaLoad();
  }, [web3auth, provider]);

  const createFullDid = async () => {
    const conn = await Kilt.connect(process.env.KILT_WSS_ADDRESS!);
    console.log(conn);
    const api = Kilt.ConfigService.get('api');
    const kiltAddress = encodeAddress(decodeAddress((polkadotKeyPair as any).address), 38);
    const authenticationKey = utils.generateAuthenticationKey() as any;
    // Generate the DID-signed creation tx and submit it to the blockchain with the specified account.
    // The submitter account parameter, ensures that only an entity authorized by the DID subject
    // can submit the tx to the KILT blockchain.
    const fullDidCreationTx = await Kilt.Did.getStoreTx(
      {
        authentication: [authenticationKey],
      },
      kiltAddress,
      utils.getKeypairTxSigningCallback(authenticationKey),
    );
    console.log(authenticationKey);
    console.log(fullDidCreationTx);
    // await Kilt.Blockchain.signAndSubmitTx(fullDidCreationTx, polkadotKeyPair as any);

    // // The new information is fetched from the blockchain and returned.
    // const fullDid = Kilt.Did.getFullDidUriFromKey(polkadotKeyPair as any);
    // const encodedUpdatedDidDetails = await api.call.did.query(Kilt.Did.toChain(fullDid));
    // const kiltDocument = Kilt.Did.linkedInfoFromChain(encodedUpdatedDidDetails).document;
    // console.log('kiltDocument', kiltDocument);
  };

  return (
    <>
      <AdminLayout>
        <div>
          <div className="rounded-sm p-4 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 w-[95%]">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">Create DID</h3>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button
            className="flex flex-row w-full h-10 py-2 justify-center rounded-full bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3"
            onClick={() => createFullDid()}
          >
            <div>Create Full DID</div>
          </button>
        </div>
      </AdminLayout>
    </>
  );
};

export default Transactions;
