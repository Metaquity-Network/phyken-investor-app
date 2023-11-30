'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/src/layout';
import LiveAssetCard from '@/src/components/cards/liveAssetCard';
import { LiveAssetCardProps } from '@/src/types/cards';
import Breadcrumb from '@/src/components/Breadcrumbs/Breadcrumb';
import axios from 'axios';

const Assets: React.FC = () => {
  const [openTab, setOpenTab] = useState(1);
  const [activeAssets, setActiveAssets] = useState<any[]>([]);
  const activeClasses = 'bg-primary text-white hover:opacity-100';
  const inactiveClasses = 'bg-gray dark:bg-meta-4 text-black dark:text-white';

  useEffect(() => {
    getActiveAssets();
  }, []);

  const getActiveAssets = async () => {
    const res = await axios.get('/api/assets/getActiveAssets');
    if (res.status === 200) {
      const assetList = res.data;
      // setActiveAssets(assetList);
      console.log('assetList', assetList);
      setActiveAssets(assetList);
    } else {
      setActiveAssets([]);
    }
  };

  const cardsItemTwoData: LiveAssetCardProps[] = [
    {
      id: '12',
      image: 'https://metaquity-upload.s3.ap-northeast-1.amazonaws.com/9121c222-78b6-43a1-97e6-088b2c3488b7',
      title: 'Asset-1',
      description:
        'Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et.',
      tags: ['New', 'Asset'],
      totalValue: 1200000,
      lockedValue: 1000000,
      fixedRate: 9.7,
      lockPeriod: 6,
      minimumInvestment: 10000,
      dealValue: 1200000,
    },
    {
      id: '12',
      image: 'https://metaquity-upload.s3.ap-northeast-1.amazonaws.com/9121c222-78b6-43a1-97e6-088b2c3488b7',
      title: 'Asset-1',
      description:
        'Lorem ipsum dolor sit amet, vehiculaum ero felis loreum fitiona fringilla goes scelerisque Interdum et.',
      tags: ['New', 'Asset'],
      totalValue: 1200000,
      lockedValue: 1000000,
      fixedRate: 9.7,
      lockPeriod: 24,
      minimumInvestment: 10000,
      dealValue: 1200000,
    },
  ];

  return (
    <>
      <AdminLayout>
        <Breadcrumb pageName={['Assets']} />
        <div className="rounded-sm p-4 dark:border-strokedark dark:bg-boxdark md:p-6 xl:p-7.5 w-[95%]">
          <div className="flex mb-7.5 2xsm:flex-col-3  2xsm:w-[45%] md:flex-row gap-1 pb-5 dark:border-strokedark">
            <Link
              href=""
              className={`rounded-full py-3 px-3 text-sm font-medium hover:bg-primary hover:opacity-80 hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
                openTab === 1 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(1)}
            >
              Live
            </Link>
            <Link
              href=""
              className={`rounded-full py-3 px-3 text-sm font-medium hover:bg-primary hover:opacity-80 hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
                openTab === 2 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(2)}
            >
              Upcoming
            </Link>
            <Link
              href=""
              className={`rounded-full py-3 px-3 text-sm font-medium hover:bg-primary hover:opacity-80 hover:text-white dark:hover:bg-primary md:text-base lg:px-6 ${
                openTab === 3 ? activeClasses : inactiveClasses
              }`}
              onClick={() => setOpenTab(3)}
            >
              Complete
            </Link>
          </div>

          <div>
            <div className={`leading-relaxed ${openTab === 1 ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-3">
                {activeAssets.length > 0 ? (
                  activeAssets.map((card, key) => {
                    return (
                      <LiveAssetCard
                        id={card.id}
                        image={card.assetImageURL}
                        title={card.name}
                        description={card.description}
                        tags={card.tags}
                        totalValue={card.totalValue}
                        lockedValue={card.lockedValue}
                        fixedRate={card.fixedRate}
                        lockPeriod={card.lockPeriod}
                        minimumInvestment={card.minimumInvestment}
                        dealValue={card.dealValue}
                        key={key}
                      />
                    );
                  })
                ) : (
                  <span>No active assets to invest</span>
                )}
              </div>
            </div>
            <div className={`leading-relaxed ${openTab === 2 ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-3">
                {cardsItemTwoData.length > 0 ? (
                  cardsItemTwoData.map((card, key) => <LiveAssetCard key={key} {...card} />)
                ) : (
                  <span>No active assets to invest</span>
                )}
              </div>
            </div>
            <div className={`leading-relaxed ${openTab === 3 ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-3">testset</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default Assets;
