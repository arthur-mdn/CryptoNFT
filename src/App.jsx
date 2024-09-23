import './App.css'
import Wallet from "./components/Wallet.jsx";
import {AuthProvider, useAuth} from "./AuthContext.jsx";
import ConnectWallet from "./components/ConnectWallet.jsx";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import {fetchCandyMachine, mplCandyMachine} from "@metaplex-foundation/mpl-candy-machine";
import config from "./config.js";
import {createSignerFromKeypair, publicKey, signerIdentity} from "@metaplex-foundation/umi";
import {useEffect, useState} from "react";
import MintNFT from "./components/MintNFT.jsx";
import Gallery from "./components/Gallery.jsx";
import {FaBan, FaCheck, FaTriangleExclamation} from "react-icons/fa6";

function AuthenticatedApp() {
    const {walletConnected} = useAuth();
    const [remainingUnits, setRemainingUnits] = useState(null);

    const umi = createUmi('https://api.devnet.solana.com').use(mplCandyMachine());
    let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(config.secretKeyArray));

    const signer = createSignerFromKeypair(umi, keypair);

    umi.use(signerIdentity(signer));

    const [candyMachine, setCandyMachine] = useState(null);

    const getCandyMachine = async () => {
        const candyMachinePublicKey = publicKey(config.candyMachineId);
        const fetchedCandyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
        setCandyMachine(fetchedCandyMachine);
        console.log('Candy Machine data:', fetchedCandyMachine);
    }

    useEffect(() => {
        getCandyMachine();
    }, []);

    useEffect(() => {
        if (candyMachine && candyMachine.items) {
            const mintedItems = Array.from(candyMachine.items.values()).filter(item => item.minted);
            setRemainingUnits(candyMachine.items.length - mintedItems.length);
        }
    }, [candyMachine]);

    return (
        <>
            <br/>
            <br/>
            <div className={"fc g2 hero-section"}>
                <div className={"fr g1 jc-sb"}>
                    <div className={"content fc g0-5 jc-sb ai-fs"}>
                        <div className={'fc g1'}>
                            <h2 className={"fw-b bungee title"}>Réclamez votre NFT MyDigitalSchool !</h2>
                            <p className={"fs-m bungee o0-5"}>Gardez un souvenir de votre passage à MyDigitalSchool en récupérant votre NFT unique.</p>
                        </div>
                        {
                            candyMachine && candyMachine.items && (
                                <>
                                {walletConnected ? (
                                        <MintNFT candyMachine={candyMachine} reloadCandyMachine={getCandyMachine}/>
                                    ) : (
                                    <>
                                        <div className={"indicator"}>
                                            <FaTriangleExclamation/>
                                            <h3 className={"fw-b cr"}>Portefeuille non connecté</h3>
                                        </div>
                                        <ConnectWallet/>
                                    </>
                                    )}
                                </>
                            )
                        }
                    </div>
                    <img src={'/FRIENDLY_CLOUD.jpeg'}/>
                </div>
                <div className={"fr g1 jc-sb key-values"}>
                    <div className={'key'}>
                        <h3 className={'bungee'}>{candyMachine && candyMachine.items && (
                            candyMachine.items.length
                        )}</h3>
                        <span>NFTs</span>
                    </div>
                    <div className={'key'}>
                        <h3 className={'bungee'}>{remainingUnits}</h3>
                        {
                            remainingUnits !== null && (
                                remainingUnits === 1 ? (
                                        <span>Un seul NFT disponible !</span>
                                    ) :
                                    remainingUnits === 0 ? (
                                        <span>Tous les NFTs ont été récupérés</span>
                                    ) : (
                                        <span>NFTs disponibles</span>
                                    )
                            )
                        }
                    </div>
                    <div className={'key'}>
                        <h3 className={'bungee'}>
                            {candyMachine && candyMachine.items && (
                                candyMachine.items.filter(item => item.minted).length
                            )}
                        </h3>
                        <span>NFTs récupérés</span>
                    </div>
                </div>
            </div>
            <br/>
            {
                candyMachine && candyMachine.items &&
                <>
                <Gallery candyMachine={candyMachine}/>
                </>
            }

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
