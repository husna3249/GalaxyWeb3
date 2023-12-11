import React, { useState } from 'react';
import axios from 'axios';
import './NFTDisplay.css';

function NFTDisplay() {
  const [nfts, setNfts] = useState([]);
  const [contractAddress, setContractAddress] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
      } catch (error) {
        console.error('Error connecting to MetaMask', error);
      }
    } else {
      alert('Please install MetaMask.');
    }
  };

  const fetchNFTs = (contractAddr) => {
    axios.get(`http://localhost:4000/fetch-nft-holders/${contractAddr}`)
      .then(response => {
        const fetchedNfts = response.data;
        setNfts(fetchedNfts);
      })
      .catch(error => console.error('Error fetching NFTs:', error));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userAddress = await connectWallet();
    if (userAddress) {
      fetchNFTs(contractAddress);
    }
  };

  const convertIPFSUrl = (url) => {
    if (url && url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    return url;
  };

  const defaultImage = 'path-to-default-image.jpg';

  return (
    <div className="nft-display-container">
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={contractAddress} 
          onChange={(e) => setContractAddress(e.target.value)} 
          placeholder="Enter Contract Address" 
        />
        <button type="submit">Show NFTs</button>
      </form>
      <h2>NFT Holdings</h2>
      <table className="nft-table">
        <thead>
          <tr>
            <th>Owner</th>
            <th>Image</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {nfts.map((nft, index) => {
            const metadata = nft.metadata ? JSON.parse(nft.metadata) : {};

            return (
              <tr key={index}>
                <td>{nft.owner}</td>
                <td className="nft-image-cell">
                  <a
                    href={`https://testnets.opensea.io/assets/sepolia/${nft.token_address}/${nft.token_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="circle-outer">
                      <div className="circle-inner">
                        <img
                          src={metadata.image ? convertIPFSUrl(metadata.image) : defaultImage}
                          alt={metadata.name || 'NFT Image'}
                          className="nft-image"
                          onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
                        />
                      </div>
                    </div>
                  </a>
                </td>
                <td>{metadata.name || 'Unnamed NFT'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default NFTDisplay;
