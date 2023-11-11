import React from 'react';
import { CardTwoItemProps } from '@/src/types/cards';

const DashboardCardTwo: React.FC<CardTwoItemProps> = ({ imageSrc, name, count, url }) => {
  return (
    <>
      <div className="rounded-sm border border-stroke bg-ghostwhite-100 p-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-row items-center justify-between p-3 xl:p-8">
          <div className="w-40 font-semibold text-lg">{name}</div>
          {/* <div className="w-16 h-16 bg-white md:w-20 md:h-20 lg:w-15 lg:h-15 bg-blue-500 rounded-full flex items-center justify-center -rotate-45">
            <FaArrowRight />
          </div> */}
          <div className=" text-zinc-900 text-7xl font-normal font-['Inter'] leading-10">{count}</div>
        </div>
      </div>
    </>
  );
};

export default DashboardCardTwo;
