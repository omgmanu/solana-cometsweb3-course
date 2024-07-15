import { initializeKeypair } from './initializeKeypair';
import { Connection, clusterApiUrl, PublicKey, Signer } from '@solana/web3.js';
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  NftWithToken,
} from '@metaplex-foundation/js';
import * as fs from 'fs';
import { comets } from './comets';

interface NftData {
  name: string;
  symbol: string;
  description: string;
  sellerFeeBasisPoints: number;
  imageFile: string;
}

interface CollectionNftData {
  name: string;
  symbol: string;
  description: string;
  sellerFeeBasisPoints: number;
  imageFile: string;
  isCollection: boolean;
  collectionAuthority: Signer;
}

// example data for a new NFT
const nftData = {
  name: `Comet: ${comets[Math.floor(Math.random() * comets.length)]}`,
  symbol: 'CMTS',
  description: 'Comet Description',
  sellerFeeBasisPoints: 0,
  imageFile: 'solana.png',
};

// example data for updating an existing NFT
const updateNftData = {
  name: 'Updated Comet: Comets of Web3',
  symbol: 'CMTSUPDATE',
  description: 'This comet has been updated!',
  sellerFeeBasisPoints: 9,
  imageFile: 'success.png',
};

async function uploadMetadata(
  metaplex: Metaplex,
  nftData: NftData,
): Promise<string> {
  // file to buffer
  const buffer = fs.readFileSync('lesson-5/assets/' + nftData.imageFile);

  // buffer to metaplex file
  const file = toMetaplexFile(buffer, nftData.imageFile);

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file);
  console.log('image uri:', imageUri);

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log('metadata uri:', uri);
  return uri;
}

async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData,
  collectionMint: PublicKey,
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri, // metadata URI
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
      collection: collectionMint,
    },
    { commitment: 'finalized' },
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  await metaplex.nfts().verifyCollection({
    //this is what verifies our collection as a Certified Collection
    mintAddress: nft.mint.address,
    collectionMintAddress: collectionMint,
    isSizedCollection: true,
  });

  return nft;
}

async function createCollectionNft(
  metaplex: Metaplex,
  uri: string,
  data: CollectionNftData,
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: data.name,
      sellerFeeBasisPoints: data.sellerFeeBasisPoints,
      symbol: data.symbol,
      isCollection: true,
    },
    { commitment: 'finalized' },
  );

  console.log(
    `Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  return nft;
}

// helper function update NFT
async function updateNftUri(
  metaplex: Metaplex,
  uri: string,
  mintAddress: PublicKey,
) {
  // fetch NFT data using mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // update the NFT metadata
  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: 'finalized' },
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`,
  );

  console.log(
    `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`,
  );
}

async function main(doUpdate: boolean = false) {
  const connection = new Connection(clusterApiUrl('devnet'));

  // init deployer
  const deployer = await initializeKeypair(connection);

  console.log('Deployer address:', deployer.publicKey.toBase58());

  // metaplex init
  const metaplexInstance = new Metaplex(connection)
    .use(keypairIdentity(deployer))
    .use(
      bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      }),
    );

  const collectionData = {
    name: 'Comets NFT Collection',
    symbol: 'CMTS',
    description: 'Test Description Here...',
    sellerFeeBasisPoints: 5,
    imageFile: 'success.png',
    isCollection: true,
    collectionAuthority: deployer,
  };

  // upload data and get the collection metadata URI
  const collectionMetadataUri = await uploadMetadata(
    metaplexInstance,
    collectionData,
  );

  // create the collection
  const collection = await createCollectionNft(
    metaplexInstance,
    collectionMetadataUri,
    collectionData,
  );

  // upload the NFT data and get the URI for the metadata
  const uri = await uploadMetadata(metaplexInstance, nftData);
  console.log('Collection launched!');

  // create an NFT using the helper function and the URI from the metadata
  const nft = await createNft(
    metaplexInstance,
    uri,
    nftData,
    collection.mint.address,
  );

  if (doUpdate) {
    // upload updated NFT data and get the new URI for the metadata
    const updatedUri = await uploadMetadata(metaplexInstance, updateNftData);

    // update the NFT using the helper function and the new URI from the metadata
    await updateNftUri(metaplexInstance, updatedUri, nft.address);
  }
}

main(true)
  .then(() => {
    console.log('Finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
