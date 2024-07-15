import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import {
    Connection,
    PublicKey,
    clusterApiUrl,
} from "@solana/web3.js";
import { createAccount } from "@solana/spl-token";

const TOKEN_MINT_ADDRESS = 'CYCCJcALXhG1QiJsqFD2t4f7sAn2ybdT75zTTRJZGkNL';

const connection = new Connection(clusterApiUrl("devnet"), 'confirmed');
const keypair = getKeypairFromEnvironment("SECRET_KEY");

const tokenAccount = await createAccount(
    connection,
    keypair,
    new PublicKey(TOKEN_MINT_ADDRESS),
    keypair.publicKey
  );

  console.log(`Token account: ${tokenAccount}`);