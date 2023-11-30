import axios from 'axios';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/reducers/store';
import PolkadotRPC from '@/src/context/wallet/polkadotRPC';
import { deleteCookie, getCookie } from 'cookies-next';
import { addUserDetails } from '@/src/reducers/features/userDetails.reducers';
import { useWeb3Auth } from '@/src/hooks/useWeb3Auth';
import { walletLogin } from '@/src/reducers/features/wallet.reducers';

export const Connect = () => {
  const router = useRouter();
  const { web3auth, provider } = useWeb3Auth();

  const dispatch = useDispatch<AppDispatch>();

  const loginAPI = async (loginRequest: any) => {
    try {
      const response = await axios.post(`/api/auth/login`, loginRequest);
      if (response.status === 200) {
        const userResponse = await axios.get(`/api/user/getUserDetails`);
        if (userResponse.data.userInfo) {
          router.push('/');
        } else {
          router.push('/user');
        }
      }
    } catch (error) {
      logout();
      console.error(error);
    }
  };

  const logout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    const res = await axios.post('/api/auth/logout');
    if (res.status === 200) {
      router.push('/login');
    }
  };

  const getRedirect = () => {
    const redirect = getCookie('redirect');
    if (redirect) {
      deleteCookie('redirect');
      return redirect.toString();
    }
    return '/';
  };

  const login = async () => {
    if (!web3auth) {
      console.log('web3auth not initialized yet');
      return;
    }
    try {
      await web3auth.initModal();
      await web3auth.connect();
      if (web3auth.provider) {
        const rpc = new PolkadotRPC(web3auth.provider);
        const userAccount = await rpc.getAccounts();
        dispatch(walletLogin(userAccount));
        const user = await web3auth.getUserInfo();
        dispatch(
          addUserDetails({
            email: user.email,
            username: user.name,
            profileImage: user.profileImage,
            isMfaEnabled: user.isMfaEnabled,
          }),
        );
        loginAPI({
          ...user,
          authType: user.typeOfLogin,
          tokenID: user.idToken,
          walletAddress: userAccount,
          userRole: 'BUYER',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {web3auth && (
        <button
          type="button"
          className="w-full h-10 py-2 rounded-full bg-primary hover:bg-opacity-90 p-3 font-medium text-gray gap-3"
          onClick={login}
        >
          Login With Web3Auth
        </button>
      )}
    </>
  );
};
