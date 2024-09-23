import PropTypes from 'prop-types';
Gallery.propTypes = {
    nftCollection: PropTypes.shape({
        nfts: PropTypes.arrayOf(PropTypes.shape({
            uri: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            description: PropTypes.string
        })).isRequired
    }).isRequired
};

function Gallery({nftCollection}) {
    return (
        <div>
            <div className={"p1 card fc g1"}>
                <h3 className={'fw-b'}>Collection Gallery</h3>
                <div className={"fc g1"}>
                    {nftCollection.nfts && nftCollection.nfts.map((nft, index) => (
                        <div key={index} className={'collection-item fr g1'}>
                            <img src={nft.image} alt={`NFT ${nft.name}`}/>
                            <div className={"fc ai-fs"}>
                                <h4 className={'fw-b'}>{nft.name}</h4>
                                <p style={{color: '#6B7280'}}>{nft.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Gallery;