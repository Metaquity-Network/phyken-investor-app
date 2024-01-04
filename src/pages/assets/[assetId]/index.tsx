'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/src/layout';
import Breadcrumb from '@/src/components/Breadcrumbs/Breadcrumb';
import { ToastContainer } from 'react-toastify';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/router';
import { convertNumberToMonthsAndYears } from '@/src/helper/numberToYearsAndMonths';
import ProgressBar from '@/src/components/progress/progressBar';
import Dropdown from '@/src/components/Dropdown/dropdown';
import { FaQuestionCircle } from 'react-icons/fa';

const FractionalizeAsset: React.FC = () => {
  const router = useRouter();
  const [assetDetails, setAssetDetails] = useState<any>();
  const [investmentDetails, setInvestmentDetails] = useState<any>();
  const [inveestmentPeriod, setInvestmentPeriod] = useState<any>();

  useEffect(() => {
    getAssetById();
  }, []);

  const getAssetById = async () => {
    const res = await axios.get(`/api/assets/getAssetById`, { params: { id: router.query.assetId } });
    if (res.status === 200) {
      const asset = res.data;
      console.log(asset);
      setAssetDetails(asset);
    }
  };

  const openDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const viewPolkaTx = (hash: string) => {
    const url = `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.testnet.metaquity.xyz#/explorer/query/${hash}`;
    window.open(url, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setInvestmentDetails(e.target.value);
  };

  return (
    <>
      <AdminLayout>
        <Breadcrumb pageName={['Asset Details']} />
        {assetDetails ? (
          <div className="p-3 grid grid-cols-6">
            <div className="col-span-4">
              <div className="bg-gray-2 rounded-md overflow-hidden shadow-md w-full">
                <div className="bg-gray-200 px-4 py-2 mt-2">
                  {assetDetails?.tags.length > 0
                    ? assetDetails.tags.map((tag: any) => (
                        <span className="bg-primary text-white px-2 py-1 rounded-full mr-2">{tag}</span>
                      ))
                    : null}
                </div>

                <div className="flex items-start p-4">
                  <div className="flex flex-col w-2/3 justify-between">
                    {/* Top div */}
                    <div className="flex justify-start font-bold text-xl mb-2">
                      <h2 className="font-bold text-3xl">{assetDetails?.name}</h2>
                    </div>

                    <p className="text-gray-700 mb-4">India's pioneer in on going green assets.</p>

                    {/* Bottom div */}
                    <div className="mt-18 flex flex-row">
                      <p className="text-success font-bold text-xl">Asset Score: 757/800</p>
                      <div className="p-1">
                        <div className="group relative inline-block">
                          <FaQuestionCircle />
                          <div className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded bg-black py-1.5 px-4.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100">
                            <span className="absolute bottom-[-3px] left-1/2 -z-10 h-2 w-2 -translate-x-1/2 rotate-45 rounded-sm bg-black"></span>
                            Phyken Verified
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <img className="w-1/3 h-auto object-cover mr-4" src={assetDetails?.assetImageURL} alt="Image" />
                </div>
              </div>
              <div className="mt-5">
                <div className="grid grid-cols-6">
                  {/* Left Column */}
                  <div className="col-span-4">
                    <div>
                      <h2 className="text-2xl font-bold">About this asset</h2>
                    </div>
                    <p>{assetDetails?.description}</p>
                  </div>

                  {/* Right Column */}
                  <div className="col-span-2 flex flex-col justify-center items-center space-y-4">
                    <div>
                      <p
                        className="text-lg font-bold underline cursor-pointer text-primary"
                        onClick={() => openDocument(assetDetails.assetContractURL)}
                      >
                        Asset Document
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-lg font-bold underline cursor-pointer text-primary"
                        onClick={() => openDocument(assetDetails.orgStructureURL)}
                      >
                        Organization
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-lg font-bold underline cursor-pointer text-primary"
                        onClick={() => viewPolkaTx(assetDetails.nftDetails.nftBlockMint)}
                      >
                        NFT on Chain
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-lg font-bold underline cursor-pointer text-primary"
                        onClick={() => viewPolkaTx(assetDetails.nftFractionalizationDetails.fractionalizationBlockMint)}
                      >
                        Fractionalization on Chain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-2 px-4">
              <div className="grid grid-cols-2 text-lg font-semibold pb-3">
                <p>Returns (IRR)</p>
                <p>{assetDetails?.fixedRate}%</p>
              </div>
              <div className="grid grid-cols-2 py-1">
                <p>Lock-in Period</p>
                <p>{convertNumberToMonthsAndYears(assetDetails?.lockPeriod)}</p>
              </div>
              <div className="grid grid-cols-2 py-1">
                <p>Min Investment</p>
                <p>{assetDetails?.minimumInvestment}</p>
              </div>
              <div className="grid grid-cols-2 py-1">
                <p>Max Investment</p>
                <p>{assetDetails?.minimumInvestment * 4}</p>
              </div>
              <div className="grid grid-cols-2 py-1">
                <p>Asset Value</p>
                <p>{assetDetails?.totalValue}</p>
              </div>
              <div className="grid grid-cols-2 py-1">
                <p>Asset Life</p>
                <p>25 Years</p>
              </div>
              <div className="grid grid-cols-2 py-1">
                <p>Entry Load</p>
                <p>1%</p>
              </div>
              <div className="pt-4">
                <div className="flex flex-col justify-between">
                  <p className="font-bold pb-2">Locked value: ${assetDetails?.lockedValue}</p>
                </div>
                <ProgressBar percentage={(assetDetails.lockedValue / assetDetails.totalValue) * 100} />
              </div>
              <div className="grid py-5">
                <input
                  type="text"
                  placeholder="Enter Amount"
                  name="amount"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <div className="pt-5 w-full">
                  <Dropdown
                    title={'LockIn Period'}
                    options={['6 Months', '12 Months', '24 Months']}
                    onSelect={(selectedOption: any) => setInvestmentPeriod(selectedOption)}
                  />
                </div>
                <div className="pt-5 w-full">
                  <button
                    className="flex flex-row w-full h-10 py-2 justify-center rounded-md  bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3"
                    // onClick={}
                  >
                    <div>Invest</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <ToastContainer />
      </AdminLayout>
    </>
  );
};

export default FractionalizeAsset;
