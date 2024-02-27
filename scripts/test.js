const hre = require("hardhat");

const ACCOUNT_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDRESS);
  const count = await account.count();

  //   const code = await hre.ethers.provider.getCode(EP_ADDR);

  console.log(count);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
