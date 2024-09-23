import Gallery from "./Gallery.jsx";
import MintNFT from "./MintNFT.jsx";
import CreateCollection from "./CreateCollection.jsx";

const NFT = () => {
    const nftCollection = {
        id: null,
        name: "MDS NFT Collection",
        description: "This is a collection of unique NFTs representing a cute cloud being diplomed from MDS.",
        uri: "https://ipfs.io/ipfs/QmUhmAkHDWZzqjkG4LGYuCSNLe8t2C99eSYuZXMtqDEdF8",
        sellerFeeBasisPoints: 500,
        nfts: [
            {
                name: "NFT MDS #0",
                symbol: "NFTMDS",
                seller_fee_basis_points: 500,
                description: "Unique NFT generated for My Digital School",
                creators: [
                    {
                        address: "WALLET_ADDRESS",
                        share: 100
                    }
                ],
                uri: "https://gateway.pinata.cloud/ipfs/QmVi1YKJ2BbL8J1m8Av49crTabindhhyjWS1FwDNwYntdw",
                image: "https://gateway.pinata.cloud/ipfs/QmSSBGsCcmpEsgvRzWgEyXGukNMA7nqEftSw2upbC1FAkV",
                edition: 1
            },
            {
                name: "NFT MDS #1",
                symbol: "NFTMDS",
                seller_fee_basis_points: 500,
                description: "Unique NFT generated for My Digital School",
                creators: [
                    {
                        address: "WALLET_ADDRESS",
                        share: 100
                    }
                ],
                uri: "https://gateway.pinata.cloud/ipfs/QmfFyWfx41qCwDsYn3DRYXV1KFesrZciNpwCwbiMW8N8PN",
                image: "https://gateway.pinata.cloud/ipfs/QmP3Nva3d6iS8EU69CPqczYLHyWz4FKGUWCX2RCxbUcwuk",
                edition: 2
            }
        ]
    };

    return (
        <div className={"fc g1"}>
            <CreateCollection nftCollection={nftCollection}/>
            <MintNFT nftCollection={nftCollection}/>
            <Gallery nftCollection={nftCollection}/>
        </div>
    );
};

export default NFT;
