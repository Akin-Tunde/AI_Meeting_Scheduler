import { Wallet } from "@ethersproject/wallet";
import * as fs from "fs";

const wallet = Wallet.createRandom();
const privateKey = wallet.privateKey;

fs.writeFileSync(".env", `PRIVATE_KEY=${privateKey}\n`);
console.log("Generated .env file with PRIVATE_KEY.");


