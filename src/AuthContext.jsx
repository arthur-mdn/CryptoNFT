import {createContext, useContext, useEffect, useState} from 'react';
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [walletBalance, setWalletBalance] = useState(null);

    const checkIfWalletIsConnected = async () => {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect({onlyIfTrusted: true});
                setWalletConnected(true);
                setWalletAddress(response.publicKey.toString());
                setProvider(window.solana);
            } catch (err) {
                console.error('Erreur de connexion au portefeuille:', err);
            }
        } else {
            alert('Phantom Wallet non détecté. Veuillez l’installer pour continuer.');
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <AuthContext.Provider value={{ walletConnected, setWalletConnected, walletAddress, setWalletAddress, provider, walletBalance, setWalletBalance }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
