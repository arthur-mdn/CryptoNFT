import {useEffect, useState} from 'react';
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {useAuth} from "../AuthContext.jsx";

const Account = () => {

    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(null);
    const {walletConnected, setWalletConnected, walletAddress, setWalletAddress, provider, setProvider} = useAuth();

    const connectWallet = async () => {
        try {
            const response = await window.solana.connect();
            setWalletConnected(true);
            setWalletAddress(response.publicKey.toString());
            setProvider(window.solana);
        } catch (err) {
            console.error('Erreur de connexion au portefeuille:', err);
        }
    };

    const aidrop = async () => {
        try {
            setLoading(true);
            console.log("Airdrop en cours...");
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(walletAddress),
                LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(fromAirDropSignature, {commitment: "confirmed"});
            console.log(`1 SOL a été airdroppé sur votre portefeuille ${walletAddress} avec succès`);
        } catch (err) {
            console.error("Erreur lors de l'Airdrop:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkBalance = async () => {
        try {
            setLoading(true);
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const balance = await connection.getBalance(new PublicKey(walletAddress));
            console.log('Solde du portefeuille:', balance / LAMPORTS_PER_SOL);
            setBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error('Erreur lors de la vérification du solde:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
            <h2>Account</h2>
            {walletConnected ? (
                <>
                    <p>Portefeuille connecté: {walletAddress}</p>
                    <button
                        type={'button'}
                        disabled={loading}
                        onClick={aidrop}
                    >
                        Airdrop 1 SOL
                    </button>
                    <p>
                        {balance && <span>{balance} SOL</span>}
                        <button
                            type={'button'}
                            disabled={loading}
                            onClick={checkBalance}
                        >
                            Check Balance
                        </button>
                    </p>
                </>
            ) : (
                <button
                    type={'button'}
                    disabled={loading}
                    onClick={connectWallet}
                >
                    Connecter le portefeuille Phantom
                </button>
            )}
        </div>
    );
};

export default Account;