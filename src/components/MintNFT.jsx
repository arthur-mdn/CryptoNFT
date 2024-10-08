import config from "../config.js";
import {useEffect, useState} from "react";
import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";
import {mintFromCandyMachineV2, mplCandyMachine} from "@metaplex-foundation/mpl-candy-machine";
import {createSignerFromKeypair, generateSigner, publicKey, signerIdentity, transactionBuilder} from "@metaplex-foundation/umi";
import {setComputeUnitLimit} from "@metaplex-foundation/mpl-toolbox";
import {useAuth} from "../AuthContext.jsx";
import {toast} from "react-toastify";
import {fetchMetadata} from "@metaplex-foundation/mpl-token-metadata";
import {PublicKey} from "@solana/web3.js";
import axios from "axios";
import {FaGift} from "react-icons/fa6";

const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"); // Token Metadata Program ID

const MintNFT = ({candyMachine, reloadCandyMachine}) => {
    const {walletAddress} = useAuth();
    const [minting, setMinting] = useState(false);
    const [nftInfo, setNftInfo] = useState(null);
    const umi = createUmi('https://api.devnet.solana.com').use(mplCandyMachine());
    let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(config.secretKeyArray));
    let mintedNfts = JSON.parse(localStorage.getItem('mintedNfts')) || [];

    const signer = createSignerFromKeypair(umi, keypair);
    umi.use(signerIdentity(signer));

    const getMetadataAddress = (mint) => {
        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            METADATA_PROGRAM_ID
        );
        return metadataAddress;
    };

    useEffect(() => {
        if (!nftInfo) {
            return
        }
        if (nftInfo.image) {
            return
        }
        const fetchNftData = async () => {
            const response = await axios.get(nftInfo.uri.replace('gateway.pinata.cloud', 'ipfs.io'));
            const pinataToIpfs = response.data.image.replace('gateway.pinata.cloud', 'ipfs.io');
            setNftInfo({...nftInfo, image: pinataToIpfs});
        };
        fetchNftData()
    }, [nftInfo]);

    const mint = async () => {
        setMinting(true);
        try {
            console.log('Minting NFT...');

            const nftMint = generateSigner(umi);
            const nftOwner = publicKey(walletAddress);

            const response = await transactionBuilder()
                .add(setComputeUnitLimit(umi, {units: 800_000}))
                .add(
                    mintFromCandyMachineV2(umi, {
                        candyMachine: candyMachine.publicKey,
                        mintAuthority: umi.identity,
                        nftOwner,
                        nftMint,
                        collectionMint: candyMachine.collectionMint,
                        collectionUpdateAuthority: candyMachine.mintAuthority
                    })
                )
                .sendAndConfirm(umi);

            console.log('Minting response:', response);


            const nftMintPublicKey = new PublicKey(nftMint.publicKey);

            const metadataAddress = getMetadataAddress(nftMintPublicKey);
            console.log('Metadata address:', metadataAddress.toBase58());

            const metadata = await fetchMetadata(umi, metadataAddress);
            console.log('NFT Metadata:', metadata);

            setNftInfo(metadata);

            reloadCandyMachine();

            localStorage.setItem('mintedNfts', JSON.stringify([...mintedNfts, metadata.uri]));

            toast.success('NFT minted successfully!');
        } catch (error) {
            if (error.message.includes('Candy machine is empty')) {
                toast.error('Candy machine is empty. No more NFTs can be minted.');
            } else {
                console.error('Error:', error);
                toast.error(`Error: ${error.message}`);
            }

        } finally {
            setMinting(false);
        }
    }

    const manageClose = () => {
        return () => {
            setNftInfo(null);
        }
    }

    return (
        <div className={"fc g0-5 ai-fs"}>
            <button onClick={mint} disabled={minting} className={"bungee"}>
                <FaGift/>
                {minting ? 'Récupération d\'un NFT...' : 'Récupérer mon NFT'}
            </button>
            {nftInfo && (
                <div className={"nft-minted-window"}>
                    <div className={"bg"} onClick={manageClose()}></div>
                    <div className={"content fr"}>
                        <img src={nftInfo.image} alt={nftInfo.name}/>
                        <div className={"fc ai-fs"}>
                            <h1 className={'fw-b bungee'}>Félicitations !</h1>
                            <h2 className={'fw-b o0-5'}>Ce NFT est maintenant à vous.</h2>
                            <h2 className={'fw-b o0-5'}>Il a été transféré dans votre portefeuille.</h2>
                            <h3 className={"fw-b"}>{nftInfo.name}</h3>
                            <p className={'o0-5'}>{nftInfo.mint}</p>
                        </div>

                    </div>

                </div>
            )}
            {minting && (
                <div className={"nft-minted-window"}>
                    <div className={"content fr ai-c"}>
                        <div className={"p2 pr"}>
                            <div className="lds-ripple">
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                        <div className={"fc g0 ai-fs pl0 jc-c"}>
                            <h1 className={'fw-b bungee'}>Veuillez patienter</h1>
                            <h2 className={'fw-b o0-5'}>Nous vous transférons un NFT unique.</h2>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MintNFT;