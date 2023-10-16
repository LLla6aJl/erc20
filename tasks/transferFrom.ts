import { task } from 'hardhat/config'
import { BigNumber, ContractTransaction, ContractReceipt } from "ethers";
import { Address } from 'cluster';

task('transferFrom', 'Transfer from to the address')
    .addParam('token', 'Token address')
    .addParam('from', 'Sender user address')
    .addParam('to', 'Resiver user address')
    .addParam('amount', 'Token amount')
	.setAction(async ({ token, from, to, amount}, { ethers }) => {
        const Token = await ethers.getContractFactory('MyToken')
        const tokenContract = Token.attach(token)
        const contractTx: ContractTransaction = await tokenContract.transferFrom(from, to, amount);
        const contractReceipt: ContractReceipt = await contractTx.wait();
        const event = contractReceipt.events?.find(event => event.event === 'Transfer');
        const eventFrom: Address = event?.args!['from'];
        const eventTo: Address = event?.args!['to'];
        const eAmount: BigNumber = event?.args!['value'];            
    	console.log(`From: ${eventFrom}`)
    	console.log(`To: ${eventTo}`)
    	console.log(`Amount: ${eAmount}`)
    })
