'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/src/layout';
import * as Kilt from '@kiltprotocol/sdk-js';
import * as utils from '../../helper/kilt-utils';
import { useWeb3Auth } from '@/src/hooks/useWeb3Auth';
import PolkadotRPC from '@/src/context/wallet/polkadotRPC';
import { ToastContainer } from 'react-toastify';
import { useToast } from '@/src/hooks/useToast';

const Transactions: React.FC = () => {
  const { showToast } = useToast();
  const { web3auth, provider } = useWeb3Auth();
  const [polkadotKeyPair, setPolkadotKeyPair] = useState<Kilt.KiltKeyringPair>();

  useEffect(() => {
    const polkaLoad = async () => {
      if (!web3auth) {
        console.log('web3auth not initialized yet');
        return;
      }
      await web3auth.initModal();
      if (web3auth.provider) {
        const rpc = new PolkadotRPC(web3auth.provider);
        const keypair = await rpc.getPolkadotKeyPair();
        setPolkadotKeyPair(keypair);
        showToast('Connected to blockchain', { type: 'info' });
      }
    };

    polkaLoad();
  }, [web3auth, provider]);

  const createFullDid = async () => {
    await Kilt.connect(process.env.KILT_WSS_ADDRESS!);
    const api = await Kilt.ConfigService.get('api');
    const fullDid = Kilt.Did.getFullDidUriFromKey(polkadotKeyPair as any);
    const encodedUpdatedDidDetails = await api.call.did.query(Kilt.Did.toChain(fullDid));
    const kiltDocument = Kilt.Did.linkedInfoFromChain(encodedUpdatedDidDetails).document;
    if (!kiltDocument) {
      const paymentAccountKey = utils.getPaymentAccountKey();
      const privateKey = await web3auth?.provider?.request({ method: 'private_key' });
      const keyring = new Kilt.Utils.Keyring({
        ss58Format: 38,
        type: 'sr25519',
      });
      const userKiltKeyPair: Kilt.KeyringPair = keyring.addFromUri('0x' + privateKey);
      const fullDidCreationTx = await Kilt.Did.getStoreTx(
        {
          authentication: [userKiltKeyPair as any],
        },
        paymentAccountKey.address,
        utils.getKeypairTxSigningCallback(userKiltKeyPair as any),
      );
      await Kilt.Blockchain.signAndSubmitTx(fullDidCreationTx, paymentAccountKey);
      console.log(fullDidCreationTx);
      showToast('User DID created', { type: 'success' });
    } else {
      console.log('User DID already exists');
      showToast('User DID already exists', { type: 'info' });
    }
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
        <ToastContainer />
      </AdminLayout>
    </>
  );
};

export default Transactions;
