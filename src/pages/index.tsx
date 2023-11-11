'use client';
import { NextPage } from 'next';
import { AdminLayout } from '../layout';
import { AssetList } from '../types/asset';
import { useRouter } from 'next/router';
import { FaPlus, FaQuestionCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../reducers/store';
import DashboardCardTwo from '../components/cards/dashboardCardTwo';
import axios from 'axios';
import { useWeb3Auth } from '@/src/hooks/useWeb3Auth';
import PolkadotRPC from '@/src/context/wallet/polkadotRPC';
import { ToastContainer } from 'react-toastify';
import { useToast } from '../hooks/useToast';

const Home: NextPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { web3auth, provider } = useWeb3Auth();
  const [assetUploadedList, setAssetUploadedList] = useState<AssetList[]>([]);
  const [assetPendingList, setAssetPendingList] = useState<AssetList[]>([]);
  const userDetails = useAppSelector((state) => state.userDetails.value);
  const [minting, setMinting] = useState<boolean>(false);

  useEffect(() => {
    getAssetList();
  }, []);

  const getAssetList = async () => {
    const res = await axios.get('/api/assets/getAssets');
    if (res.status === 200) {
      const assetList = res.data;
      const assetUploadedList = assetList.filter((asset: { assetStatus: string }) =>
        ['ACTIVE'].includes(asset.assetStatus),
      );
      setAssetUploadedList(assetUploadedList);
      const assetPendingList = assetList.filter((asset: { assetStatus: string }) =>
        ['PENDING'].includes(asset.assetStatus),
      );
      setAssetPendingList(assetPendingList);
    } else {
      setAssetUploadedList([]);
    }
  };

  const User = () => {
    if (userDetails) {
      return <p>Welcome Back, {userDetails.username.split(' ')[0]}</p>;
    }
    return null;
  };

  const convertToCustomFormat = (uuid: string) => {
    const parts = uuid.split('-');
    const shortenedUUID = parts[0].slice(0, 4) + '...' + parts[4].slice(-4);
    return shortenedUUID;
  };

  const mintNewAsset = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    await web3auth.initModal();
    if (web3auth.provider) {
      const rpc = new PolkadotRPC(web3auth.provider);
      setMinting(true);
      showToast('Please wait NFT is being minted', { type: 'info' });
      try {
        const mintBlock = await rpc.createNFT();
        console.log('Minted in block:', mintBlock);
        return mintBlock;
      } catch (error) {
        console.error('Error creating NFT:', error);
      }
    }
  };

  const mintAsset = async (asset: AssetList) => {
    const assetDetails = (await mintNewAsset()) as object;
    console.log('assetDetails', assetDetails);
    showToast('NFT Minted', { type: 'success' });
    await fetch('/api/assets/updateNFT', {
      method: 'POST',
      body: JSON.stringify({ ...assetDetails, id: asset.id }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    getAssetList();
  };

  const viewPolkaTx = (hash: string) => {
    const url = `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.testnet.metaquity.xyz#/explorer/query/${hash}`;
    window.open(url, '_blank');
  };

  return (
    <AdminLayout>
      <div>
        <div className="grid grid-cols-1 w-full gap-2 md:gap-6 pb-8">
          <div className="2xsm:flex-row sm:flex items-center ">
            <div className="flex-grow pt-3">
              <div className="text-zinc-900 2xsm:text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal">
                <User />
              </div>
            </div>
            <div className="pt-3">
              <button
                className="flex flex-row w-full h-10 py-2 justify-center rounded-full bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3"
                onClick={() => router.push('upload-assets')}
              >
                <div>Upload Asset</div>
                <div className="w-5 h-5 pt-1 justify-center items-center flex">
                  <FaPlus />
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
          {/* <DashboardCardOne imageSrc="" name="Abhishek" count="10" url="" /> */}
          <DashboardCardTwo imageSrc="" name="Number of assets uploaded" count={assetUploadedList.length} url="" />
          <DashboardCardTwo imageSrc="" name="Asset pending verification" count={assetPendingList.length} url="" />
        </div>
        <div className="pt-10">
          <div className="rounded-sm p-4 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 w-[95%]">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-black dark:text-white">Assets</h3>
              </div>
            </div>

            {assetUploadedList.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="grid md:grid-cols-12 grid-cols-6 py-2 text-start md:text-left">
                  <div className="md:col-span-2 hidden md:block">
                    <p className="text-l px-4 font-bold">AssetID</p>
                  </div>
                  <div className="col-span-2 ">
                    <p className="text-l font-bold">Name</p>
                  </div>
                  <div className="col-span-2 hidden md:block">
                    <p className="text-l  font-bold">Category</p>
                  </div>
                  <div className="md:col-span-2 hidden md:block">
                    <p className="text-l font-bold">Price</p>
                  </div>
                  <div className="md:col-span-2 flex">
                    <p className=" text-l font-bold pr-2">Status</p>
                    <div className="group relative inline-block">
                      <FaQuestionCircle />
                      <div className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded bg-black py-1.5 px-4.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100">
                        <span className="absolute bottom-[-3px] left-1/2 -z-10 h-2 w-2 -translate-x-1/2 rotate-45 rounded-sm bg-black"></span>
                        Link to blockchain tx
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-l font-bold">{}</p>
                  </div>
                </div>
                {assetUploadedList.map((asset: AssetList, index: number) => {
                  return (
                    <div key={index} className="grid md:grid-cols-12 grid-cols-6 py-2 text-start md:text-left">
                      <div className="md:col-span-2 hidden md:block">
                        <p className="text-sm px-4">{convertToCustomFormat(asset.id)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">{asset.name}</p>
                      </div>
                      <div className="md:col-span-2 hidden md:block">
                        <p className="text-sm">{asset.category}</p>
                      </div>
                      <div className="md:col-span-2 hidden md:block">
                        <p className="text-sm ">{asset.assetPrice}</p>
                      </div>
                      <div className="md:col-span-2">
                        {asset.nftFractionalizationDetails ? (
                          <p
                            className="text-sm hover:cursor-pointer"
                            onClick={() => viewPolkaTx(asset.nftFractionalizationDetails.fractionalizationBlockMint)}
                          >
                            Asset Fractionalized
                          </p>
                        ) : asset?.nftDetails ? (
                          <p
                            className="text-sm hover:cursor-pointer"
                            onClick={() => viewPolkaTx(asset.nftDetails.nftBlockMint)}
                          >
                            NFT Minted
                          </p>
                        ) : null}
                        <p className="text-sm "></p>
                      </div>
                      <div className="md:col-span-2">
                        {asset.nftFractionalizationDetails ? null : asset?.nftDetails ? (
                          <button
                            className="h-10 w-full py-2 justify-center rounded-full bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3"
                            onClick={() => router.push(`/fractionalize-asset/${asset.id}`)}
                          >
                            Fractionalize
                          </button>
                        ) : !minting ? (
                          <button
                            className="h-10 py-2 justify-center rounded-full bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3"
                            onClick={() => mintAsset(asset)}
                          >
                            Mint NFT
                          </button>
                        ) : (
                          <div>Minting...</div>
                        )}
                        <p className="text-sm "></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p>No assets uploaded</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </AdminLayout>
  );
};
export default Home;
