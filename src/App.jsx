import './App.css'
import Wallet from "./components/Wallet.jsx";
import {AuthProvider, useAuth} from "./AuthContext.jsx";
import ConnectWallet from "./components/ConnectWallet.jsx";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NFT from "./components/NFT.jsx";

function AuthenticatedApp() {
    const {walletConnected} = useAuth();

    return (
        <>
            {walletConnected ? (
                <div className={"fc g1"}>
                    <NFT />
                    <Wallet />
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
