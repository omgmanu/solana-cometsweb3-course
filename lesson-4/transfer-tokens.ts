import 'dotenv/config';
import {Connection, clusterApiUrl, PublicKey} from '@solana/web3.js';
import {getOrCreateAssociatedTokenAccount, transfer} from '@solana/spl-token';
import {
  getKeypairFromEnvironment,
} from '@solana-developers/helpers';

const TOKEN_MINT_ADDRESS = 'CYCCJcALXhG1QiJsqFD2t4f7sAn2ybdT75zTTRJZGkNL';
const RECEIVER_ADDRESS = 'CudRDBKDeKpenz7braYbw5QNG5TUzqNNQWpvqDUdmZXz'

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const keypair = getKeypairFromEnvironment("SECRET_KEY");

const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    new PublicKey(TOKEN_MINT_ADDRESS),
    keypair.publicKey
  );
  
  const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    keypair,
    new PublicKey(TOKEN_MINT_ADDRESS),
    new PublicKey(RECEIVER_ADDRESS)
  );
  
  // Transfer the tokens
  const transferTx = await transfer(
    connection,
    keypair,
    sourceTokenAccount.address,
    destinationTokenAccount.address,
    keypair,
    6 * Math.pow(10, 9)
  );

  console.log(`Transfer tx: ${transferTx}`);