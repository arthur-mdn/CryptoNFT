import {useAuth} from "../AuthContext.jsx";

const WalletStatusIndicator = () => {
    const {walletAddress, walletBalance} = useAuth();

    return (
        <div className={"wallet-indicator fc ai-fe g0-5"}>
            <div className={"fr g0-5"}>
                <span></span>
                <p>Portefeuille connecté : {walletAddress}</p>
            </div>
            <div className={"fr g0-5"}>
                <img src={'/solana.png'}/>
                {walletBalance} SOL
            </div>
        </div>
    );
};

export default WalletStatusIndicator;