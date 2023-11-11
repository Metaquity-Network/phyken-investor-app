'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AssetHistory } from '@/src/types/history';
import { AdminLayout } from '@/src/layout';
import TokenPrice from '@/src/components/charts/token-price';
import Breadcrumb from '@/src/components/Breadcrumbs/Breadcrumb';
import { useWeb3Auth } from '@/src/hooks/useWeb3Auth';
import PolkadotRPC from '@/src/context/wallet/polkadotRPC';

const Wallet: React.FC = () => {
  const router = useRouter();
  const { web3auth, provider } = useWeb3Auth();
  const [balance, setBalance] = useState<any>(null);
  const chatData: AssetHistory[] = [
    {
      date: '13 Dec 2020',
      image: '/imagea/assets/asset-verified.png',
      name: 'Tesco market',
      price: '$75.67',
      type: 'Buy',
    },
    {
      date: '13 Dec 2020',
      image: '/imagea/assets/asset-verified.png',
      name: 'Tesco market',
      price: '$75.67',
      type: 'Buy',
    },
    {
      date: '13 Dec 2020',
      image: '/imagea/assets/asset-verified.png',
      name: 'Tesco market',
      price: '$75.67',
      type: 'Buy',
    },
  ];

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
        setBalance(balance);
      }
    };

    polkaLoad();
  }, [web3auth, provider]);

  return (
    <>
      <AdminLayout>
        <Breadcrumb pageName={['Wallet']} />
        <div className="grid grid-cols-1 w-full gap-2 md:gap-6 pb-8">
          <div className="2xsm:flex-row sm:flex items-end md:justify-end">
            <div className="pt-3 flex md:justify-end 2xsm:flex-col 2xsm:pt-3 sm:flex-row">
              <div className="p-2">
                <button
                  className="flex flex-row w-45 h-10 py-2 justify-center rounded-full border border-primary text-primary hover:bg-opacity-90 p-3 font-medium gap-3 hover:bg-primary hover:text-white dark:text-gray-3 dark:border-gray-3 dark:hover:bg-primary"
                  onClick={() => router.push('upload-assets')}
                >
                  <div>Buy MQTY Tokens</div>
                </button>
              </div>
              <div className="p-2">
                <button
                  className="flex flex-row w-45 h-10 py-2 justify-center rounded-full border border-primary text-primary hover:bg-opacity-90 p-3 font-medium gap-3 hover:bg-primary hover:text-white dark:text-gray-3 dark:border-gray-3 dark:hover:bg-primary"
                  onClick={() => router.push('upload-assets')}
                >
                  <div>Sell MQTY Tokens</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          <div className="col-span-12 xl:col-span-7">
            <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
              <div className="col-span-12 md:col-span-6">
                <div className="rounded-sm border border-stroke bg-ghostwhite-100 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="flex flex-row items-center justify-between p-3 xl:p-8">
                    <div className="font-semibold text-lg">MQTY Tokens</div>
                    <div className=" text-zinc-900 text-7xl font-normal font-['Inter'] leading-10">
                      <div>
                        {balance ? (
                          <p className="text-lg text-bold">
                            {balance.prefix} {balance.symbol}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-6">
                <div className="rounded-sm border border-stroke bg-ghostwhite-100 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="flex flex-row items-center justify-between p-3 xl:p-8">
                    <div className="font-semibold text-lg">Price of MQTY Tokens</div>
                    <div className=" text-zinc-900 text-lg font-normal font-['Inter'] leading-10">$4</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-5">
              <TokenPrice />
            </div>
          </div>
          <div className="col-span-12 xl:col-span-5">
            <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
              <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">History</h4>

              <div>
                {chatData.map((chat, key) => (
                  <div className="flex items-center gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4" key={key}>
                    <div className="relative h-14 w-14 rounded-full">
                      <Image src="/images/user/user-01.png" alt="User" width={57} height={56} />
                    </div>

                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <h5 className="font-medium text-black dark:text-white">Tesco Market</h5>
                        <p>
                          <span className="text-xs"> Buy</span>
                        </p>
                      </div>
                      <div className="flex h-6 w-6 flex-col items-center justify-center">
                        <span className="text-lg font-bold text-white"> $75.65</span>
                        <span className="text-sm font-medium text-white"> count</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default Wallet;
