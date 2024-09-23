import {useState} from 'react';
import {useAuth} from "../AuthContext.jsx";
import {FaLink} from "react-icons/fa6";

const ConnectWallet = () => {

    const [loading, setLoading] = useState(false);
    const {setWalletConnected, setWalletAddress, setProvider} = useAuth();

    const tryToConnectWallet = async () => {
        try {
            setLoading(true);
            const response = await window.solana.connect();
            setWalletConnected(true);
            setWalletAddress(response.publicKey.toString());
            setProvider(window.solana);
        } catch (err) {
            console.error('Erreur de connexion au portefeuille:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type={'button'}
            className={"bungee"}
            disabled={loading}
            onClick={tryToConnectWallet}
        >
            <FaLink/>
            Connecter le portefeuille Phantom
        </button>
    );
};

export default ConnectWallet;