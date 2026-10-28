import { network } from "hardhat";
import { syncArtifacts } from "./sync-artifacts.js";

// Connect to the configured network (e.g. localhost/ganache)
const { viem } = await network.create();

const [deployer] = await viem.getWalletClients();
console.log(`Deploying UHMS contract with account: ${deployer.account.address}`);

const uhms = await viem.deployContract("UHMS");

console.log(`UHMS deployed successfully to: ${uhms.address}`);

const publicClient = await viem.getPublicClient();
const chainId = await publicClient.getChainId();


syncArtifacts({
  address: uhms.address,
  chainId,
  networkName: "ganache"
});
