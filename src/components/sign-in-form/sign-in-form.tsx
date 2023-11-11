import type { NextPage } from 'next';
import { Connect } from '../wallet-connect/wallet-connect';
import Image from 'next/image';

const SignInForm: NextPage = () => {
  return (
    <form className="flex flex-col items-center justify-start gap-[12px] p-5 text-black-2">
      <div className="flex flex-col items-center justify-center pt-0 px-0 pb-6">
        <div className="flex flex-col items-center justify-center">
          <div className="2xsm:block, xl:hidden">
            <Image src={'/images/logo/logo-dark.svg'} alt="Logo" width={176} height={32} />
          </div>
          <h2 className="mb-9 text-2xl font-bold sm:text-title-xl2 pt-5">Sign In to Metaquity</h2>
          <div className="flex flex-col relative text-base font-semibold font-inter text-gray-coolgray800 justify-center">
            Sign in with Web3auth
          </div>
          <div className="relative text-sm leading-[24px] font-inter text-gray-coolgray500">
            Login by Your Secure Account
          </div>
        </div>
      </div>
      <div className="pb-5">
        <Connect />
      </div>

      <div className="relative text-sm leading-[26px] font-inter text-left">
        <span className="text-graydark">{`Questions? Email us at `}</span>
        <a className="text-primary" href="mailto:support@metaquity.com">
          support@metaquity.com
        </a>
      </div>
    </form>
  );
};

export default SignInForm;
