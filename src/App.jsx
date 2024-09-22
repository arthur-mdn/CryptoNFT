import './App.css'
import Account from "./components/Account.jsx";
import NFT from "./components/NFT.jsx";
import {AuthProvider, useAuth} from "./AuthContext.jsx";
import ConnectWallet from "./components/ConnectWallet.jsx";
import WalletIndicator from "./components/WalletIndicator.jsx";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AuthenticatedApp() {
    const {walletConnected} = useAuth();

    return (
        <>
            {walletConnected ? (
                <div className={"fc g1"}>
                    <WalletIndicator />
                    <NFT />
                    <Account />
                </div>
            ) : (
                <>
                    <h2 className={"fw-b"}>Wallet non connecté</h2>
                    <ConnectWallet/>
                </>
            )}
        </>
    )
}
function App() {

  return (
    <>
        <AuthProvider>
            <ToastContainer pauseOnFocusLoss={false} closeOnClick={true}/>
            <AuthenticatedApp/>
        </AuthProvider>
    </>
  )
}

export default App
