'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/src/hooks/useToast';
import { ToastContainer } from 'react-toastify';

const Wallet: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [formSubmitData, setFormSubmitData] = useState({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormSubmitData({
      ...formSubmitData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/updateUserDetails', {
        method: 'POST',
        body: JSON.stringify({
          ...formSubmitData,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(res);
      if (res.status === 200) {
        showToast('User details uploaded', { type: 'success' });
        router.push('/');
      } else {
        showToast('Unable to update the user details', { type: 'error' });
      }
    } catch (error: any) {
      console.error('Server Error:', error.response.status, error.response.data);
      showToast(error.message, { type: 'error' });
    }
  };

  return (
    <>
      <div className="w-[100%] md:mx-auto md:w-[50%]">
        <div className="px-5 py-5 md:px-20 md:py-20">
          <div className="flex flex-row space-x-4 justify-between">
            <div className="flex flex-col">
              <h2 className="mb-9 text-2xl font-bold sm:text-title-xl2 pt-5">We are almost done 🎉</h2>
            </div>
            <div className="pt-8">
              <a className="underline text-primary cursor-pointer" onClick={() => router.push('/')}>
                SKIP
              </a>
            </div>
          </div>
          <span>You are just a few steps away from becoming a part of Phyken family of impact investor.</span>
          <form onSubmit={handleSubmit}>
            <div className="pt-10">
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="First Name as on your PAN card"
                  name="firstName"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="Last Name as on your PAN card"
                  name="lastName"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>

              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="Mobile number (+91)"
                  name="mobile"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <h5 className="font-bold py-5">Enter Your Address</h5>
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="House no/ Street"
                  name="street"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="State"
                  name="state"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="Country"
                  name="country"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
              <div className="mb-4.5">
                <input
                  type="text"
                  placeholder="Pincode"
                  name="pincode"
                  onChange={handleInputChange}
                  required
                  className="w-full rounded border-[2px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full h-10 py-2 rounded-full bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3"
            >
              Next
            </button>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Wallet;
