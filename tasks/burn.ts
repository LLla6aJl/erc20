import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('burn', 'Burn tokens to the address')
    .addParam('token', 'Token address')
    .addParam('amount', 'Token amount')
	.setAction(async ({ token, amount}, { ethers }) => {
        const Token = await ethers.getContractFactory('MyToken')
        const tokenContract = Token.attach(token)

        const contractTx: ContractTransaction = await tokenContract.burn(amount);
        const contractReceipt: ContractReceipt = await contractTx.wait();
        const event = contractReceipt.events?.find(event => event.event === 'Transfer');
        const eInitiator: Address = event?.args!['from'];
        const eAmount: BigNumber = event?.args!['value'];            
    	console.log(`Initiator: ${eInitiator}`)
    	console.log(`Burn Amount: ${eAmount}`)
    })
