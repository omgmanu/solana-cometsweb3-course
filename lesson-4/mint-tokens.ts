import 'dotenv/config';
import {Connection, clusterApiUrl, PublicKey} from '@solana/web3.js';
import {getOrCreateAssociatedTokenAccount, mintTo} from '@solana/spl-token';
import {
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const keypair = getKeypairFromEnvironment("SECRET_KEY");

const TOKEN_MINT_ADDRESS = 'CYCCJcALXhG1QiJsqFD2t4f7sAn2ybdT75zTTRJZGkNL';

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  keypair,
  new PublicKey(TOKEN_MINT_ADDRESS),
  keypair.publicKey
);

const mintTransaction = await mintTo(
  connection,
  keypair,
  new PublicKey(TOKEN_MINT_ADDRESS),
  tokenAccount.address,
  keypair,
  420 * Math.pow(10, 9)
);

console.log(`Mint tx: ${mintTransaction}`);