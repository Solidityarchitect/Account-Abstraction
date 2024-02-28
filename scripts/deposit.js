const hre = require("hardhat")

const EP_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
const EP_ADDRESS_ARB = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
const PM_ADDRESS_ARB = "0x82D137af9E9E43EC90B4D11166e0c15921bd3a8F"

async function main() {
    const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS_ARB)
    await entryPoint.depositTo(PM_ADDRESS_ARB, {
        value: hre.ethers.parseEther(".01"),
    })

    console.log("deposit was successful!")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
