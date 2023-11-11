'use client';

import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { AssetList } from '@/src/types/asset';
import Link from 'next/link';
import { AdminLayout } from '@/src/layout';

const Assets: React.FC = () => {
  const router = useRouter();
  const [openTab, setOpenTab] = useState(1);

  const activeClasses = 'bg-primary text-white hover:opacity-100';
  const inactiveClasses = 'bg-gray dark:bg-meta-4 text-black dark:text-white';

  const assetList: AssetList[] = [
    {
      id: '#123456',
      category: 'Crypto',
      name: 'Lorem',
      cost: '$500',
      nft: 'NFT',
    },
    {
      id: '#123456',
      category: 'Crypto',
      name: 'Lorem',
      cost: '$500',
      nft: 'NFT',
    },
    {
      id: '#123456',
      category: 'Crypto',
      name: 'Lorem',
      cost: '$500',
      nft: 'NFT',
    },
  ];
  return (
    <>
      <AdminLayout>
        <div className="rounded-sm p-4 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 w-[95%]">
          <div className="mb-7 flex flex-row items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-black dark:text-white">All Assets</h3>
            </div>
            <button
              className="flex-wrap mr-5 h-10 py-2 justify-center rounded-full bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3 "
              onClick={() => router.push('/upload-assets')}
            >
              <div className="hidden sm:block">Upload Asset</div>
              <div className="block sm:hidden">
                <FaPlus />
              </div>
            </button>
          </div>

          <div className="flex mb-7.5 2xsm:flex-col-3  2xsm:w-[45%] md:flex-row gap-1 pb-5 dark:border-strokedark">
            <Link
              href="#"
              className={`rounded-full py-3 px-3 text-sm font-medium hover:bg-primary hover:opacity-80 hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
                openTab === 1 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(1)}
            >
              All
            </Link>
            <Link
              href="#"
              className={`rounded-full py-3 px-3 text-sm font-medium hover:bg-primary hover:opacity-80 hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
                openTab === 2 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(2)}
            >
              Completed
            </Link>
            <Link
              href="#"
              className={`rounded-full py-3 px-3 text-sm font-medium hover:bg-primary hover:opacity-80 hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
                openTab === 3 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(3)}
            >
              Pending
            </Link>
          </div>

          <div>
            <div className={`leading-relaxed ${openTab === 1 ? 'block' : 'hidden'}`}>
              <div className="flex flex-col gap-2">
                <div className="grid md:grid-cols-10 grid-cols-6 py-2 text-start md:text-left">
                  <div className="col-span-2">
                    <p className="text-l px-4 font-bold">AssetID</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-l font-bold">Name</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-l  font-bold">Category</p>
                  </div>
                  <div className="md:col-span-2 hidden md:block">
                    <p className="text-l font-bold">Price</p>
                  </div>
                  <div className="md:col-span-2 hidden md:block">
                    <p className="text-l font-bold">NFT</p>
                  </div>
                </div>
                {assetList.map((asset: AssetList, index: number) => {
                  return (
                    <div key={index} className="grid md:grid-cols-10 grid-cols-6 py-2 text-start md:text-left">
                      <div className="col-span-2">
                        <p className="text-sm px-4">{asset.id}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">{asset.name}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">{asset.category}</p>
                      </div>
                      <div className="md:col-span-2 hidden md:block">
                        <p className="text-sm ">{asset.cost}</p>
                      </div>
                      <div className="md:col-span-2 hidden md:block">
                        <p className="text-sm">{asset.nft}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`leading-relaxed ${openTab === 2 ? 'block' : 'hidden'}`}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias
              corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Unde ex dolorum voluptate cupiditate adipisci
              doloremque, vel quam praesentium nihil veritatis.
            </div>
            <div className={`leading-relaxed ${openTab === 3 ? 'block' : 'hidden'}`}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias
              corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.{' '}
              <br />
              <br />
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Suscipit mollitia nam eligendi reprehenderit
              reiciendis saepe laboriosam maiores voluptas. Quo, culpa amet fugiat ipsam sed quod hic, veritatis ducimus
              recusandae repellat quasi eaque, suscipit praesentium totam?
            </div>
            <div className={`leading-relaxed ${openTab === 4 ? 'block' : 'hidden'}`}>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officia nisi, doloribus nulla cumque molestias
              corporis eaque harum vero! Quas sit odit optio debitis nulla quisquam, dolorum quaerat animi iusto quod.
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default Assets;
