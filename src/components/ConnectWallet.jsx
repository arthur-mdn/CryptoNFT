import {useState} from 'react';
import {useAuth} from "../AuthContext.jsx";

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
        <div style={{textAlign: 'center', marginTop: '50px'}}>
            <button
                type={'button'}
                disabled={loading}
                onClick={tryToConnectWallet}
            >
                Connecter le portefeuille Phantom
            </button>
        </div>
    );
};

export default ConnectWallet;