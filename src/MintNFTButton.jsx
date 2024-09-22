import {Fragment, useEffect, useState} from 'react';
import axios from 'axios';
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, Transaction} from '@solana/web3.js';
import {getOrCreateAssociatedTokenAccount, mintTo} from '@solana/spl-token';

const MintNFTButton = () => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(null);

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

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const airDropHelper = async () => {
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
            <h2>Mint NFT sur Solana</h2>
            {walletConnected ? (
                <>
                    <p>Portefeuille connecté: {walletAddress}</p>
                    <button
                        type={'button'}
                        disabled={loading}
                        onClick={airDropHelper}
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

export default MintNFTButton;