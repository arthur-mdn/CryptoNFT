import {useEffect, useState} from 'react';
import {clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {useAuth} from "../AuthContext.jsx";
import {toast} from "react-toastify";
import {FaArrowsRotate, FaCoins} from "react-icons/fa6";

const Wallet = () => {
    const [loading, setLoading] = useState(false);
    const {walletAddress, setWalletBalance, walletBalance} = useAuth();

    const airdrop = async () => {
        try {
            setLoading(true);
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const fromAirDropSignature = await connection.requestAirdrop(
                new PublicKey(walletAddress),
                LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(fromAirDropSignature, {commitment: "confirmed"});
            toast.success(`1 SOL a été airdroppé sur votre portefeuille avec succès`);
            console.log(`1 SOL a été airdroppé sur votre portefeuille avec succès`);
            checkBalance();
        } catch (err) {
            if(err.message.includes('airdrop limit')) {
                toast.error('Limite d\'Airdrop journalière atteinte');
                return;
            } else {
                toast.error('Erreur lors de l\'Airdrop');
            }
            console.error("Erreur lors de l'Airdrop:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkBalance = async () => {
        try {
            setLoading(true);
            setWalletBalance(null)
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const balance = await connection.getBalance(new PublicKey(walletAddress));
            console.log('Solde du portefeuille:', balance / LAMPORTS_PER_SOL);
            setWalletBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
            toast.error('Erreur lors de la vérification du solde');
            console.error('Erreur lors de la vérification du solde:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        checkBalance();
    }, [walletAddress]);

    return (
        <div className={"wallet-indicator fc ai-fe g0-5"}>
            <div className={"fr g0-5"}>
                <span></span>
                <p>Portefeuille connecté : {walletAddress}</p>
            </div>
            <section className={"fr g0-5"}>
                <div>
                    <button type={'button'} onClick={airdrop} disabled={loading}><FaCoins/></button>
                </div>
                <div>
                    <button type={'button'} onClick={checkBalance} disabled={loading}><FaArrowsRotate/></button>
                </div>
                <div className={"fr g0-5"}>
                    <img src={'/solana.png'}/>
                    {walletBalance} SOL
                </div>
            </section>
        </div>
    );
};

export default Wallet;