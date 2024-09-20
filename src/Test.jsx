import { useState, useEffect } from 'react';

const MintNFTButton = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');

    const checkIfWalletIsConnected = async () => {
        try {
            if (window.solana && window.solana.isPhantom) {
                const response = await window.solana.connect({ onlyIfTrusted: true });
                setWalletConnected(true);
                setWalletAddress(response.publicKey.toString());
            } else {
                console.log('Phantom Wallet non détecté.');
            }
        } catch (err) {
            console.error('Erreur de connexion au Phantom Wallet:', err);
        }
        try {
            if (window.ethereum && window.ethereum.isOpera) {
                const response = await window.ethereum.request({method: 'eth_requestAccounts'});
                setWalletConnected(true);
                setWalletAddress(response[0]);
            } else {
                console.log('Opera Wallet non détecté.');
            }
        } catch (err) {
            console.error('Erreur de connexion au Opera Wallet:', err);
        }
    };

    const connectWallet = async () => {
        try {
            const response = await window.solana.connect();
            setWalletConnected(true);
            setWalletAddress(response.publicKey.toString());
        } catch (err) {
            console.error('Erreur de connexion au Phantom Wallet:', err);
        }
        try {
            const response = await window.ethereum.request({method: 'eth_requestAccounts'});
            setWalletConnected(true);
            setWalletAddress(response[0]);
        } catch (err) {
            console.error('Erreur de connexion au Opera Wallet:', err);
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Mint NFT sur Solana</h2>
            {walletConnected ? (
                <>
                    <p>Portefeuille connecté: {walletAddress}</p>
                    <button
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                        onClick={() => alert('Fonctionnalité de Mint à implémenter !')}
                    >
                        Mint NFT
                    </button>
                </>
            ) : (
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#008CBA',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                    onClick={connectWallet}
                >
                    Connecter le portefeuille Phantom
                </button>
            )}
        </div>
    );
};

export default MintNFTButton;