'use client';

import type { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SignInForm from '@/src/components/sign-in-form/sign-in-form';
import { useEffect } from 'react';
import useLocalStorage from '@/src/hooks/useLocalStorage';

const Login: NextPage = () => {
  const [storedValue, setValue, clearLocalStorage, clearAllLocalStorage] = useLocalStorage('myKey', 'default');

  useEffect(() => {
    clearAllLocalStorage();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="flex flex-wrap items-center ">
        <div className="hidden w-full xl:block xl:w-1/2 bg-primary h-screen">
          <div className="py-17.5 px-26 text-center">
            <Link className="mb-5.5 inline-block" href="/">
              <Image className="hidden dark:block" src={'/images/logo/logo.svg'} alt="Logo" width={176} height={32} />
              <Image className="dark:hidden" src={'/images/logo/logo-dark.svg'} alt="Logo" width={176} height={32} />
            </Link>

            <p className="2xl:px-20">Lorem ipsum dolor sit amet, consectetur adipiscing elit suspendisse.</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 content-center border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2  md:bg-white h-screen">
          <div className="w-full justify-center items-center">
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
