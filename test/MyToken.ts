import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

const DECIMALS = 18;
const NAME = "MyToken";
const SYMBOL = "MTK";
const INITIAL_AMOUNT = ethers.utils.parseEther("10");
const ONE_TOKEN = ethers.utils.parseEther("1");

describe("MyToken contract", function () {
  let MyToken;
  let myToken: Contract;
  let owner: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress,
    users: SignerWithAddress[];

  beforeEach(async () => {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, user1, user2, ...users] = await ethers.getSigners();
    myToken = await MyToken.deploy(NAME, SYMBOL);
  });

  describe("Initial params of contract", async () => {
    it("Should properly set Name", async () => {
      expect(await myToken.name()).eq(NAME);
    });

    it("Should properly set Symbol", async () => {
      expect(await myToken.symbol()).eq(SYMBOL);
    });

    it("Should properly set Decimals", async () => {
      expect(await myToken.decimals()).eq(DECIMALS);
    });

    it("Should properly set TotalSupply", async () => {
      expect(await myToken.totalSupply()).eq(INITIAL_AMOUNT);
    });

    it("Should properly set Owner", async () => {
      expect(await myToken.owner()).eq(owner.address);
    });

    it("Should properly set Owner balance", async () => {
      expect(await myToken.balanceOf(owner.address)).eq(INITIAL_AMOUNT);
    });
  });

  describe("Contract logic", function () {
    it("Should mint from contract owner address", async () => {
      await expect(await myToken.mint(owner.address, INITIAL_AMOUNT)).to.emit(
        myToken,
        "Transfer"
      );
      expect(await myToken.balanceOf(owner.address)).eq(INITIAL_AMOUNT.mul(2));
    });

    it("Should mint to not contract owner address", async () => {
      await expect(
        //@ts-ignore
        myToken.connect(user1).mint(user1.address, INITIAL_AMOUNT)
      ).to.be.revertedWith("MyToken: you are not an owner");
      expect(await myToken.balanceOf(user1.address)).eq(0);
    });

    it("Should transfer not enough balance", async () => {
      await expect(
        myToken.transfer(user1.address, ethers.utils.parseEther("20"))
      ).to.be.revertedWith("MyToken: Not enough balance");
    });

    it("Should transfer tokens", async () => {
      await expect(
        myToken.transfer(user1.address, ethers.utils.parseEther("5"))
      ).to.emit(myToken, "Transfer");
      expect(await myToken.balanceOf(user1.address)).eq(
        ethers.utils.parseEther("5")
      );
      expect(await myToken.balanceOf(owner.address)).eq(
        ethers.utils.parseEther("5")
      );

      await expect(
        await myToken
          //@ts-ignore
          .connect(user1)
          .transfer(user2.address, ONE_TOKEN)
      ).to.emit(myToken, "Transfer");
      expect(await myToken.balanceOf(user2.address)).eq(ONE_TOKEN);
      expect(await myToken.balanceOf(user1.address)).eq(
        ethers.utils.parseEther("4")
      );
    });

    it("Should check allowance", async function () {
      await expect(
        await myToken
          //@ts-ignore
          .connect(user1)
          .approve(user2.address, ONE_TOKEN)
      ).to.emit(myToken, "Approval");
      expect(await myToken.allowance(user1.address, user2.address)).eq(
        ONE_TOKEN
      );
    });

    it("Should transferFrom Insufficient balance", async function () {
      await expect(
        //@ts-ignore
        myToken.transferFrom(
          user1.address,
          user2.address,
          ethers.utils.parseEther("1")
        )
      ).to.be.revertedWith("MyToken: Insufficient balance");
    });

    it("Should transferFrom Insufficient allowance", async function () {
      await expect(
        await myToken.transfer(user1.address, ethers.utils.parseEther("2"))
      ).to.emit(myToken, "Transfer");

      await expect(
        //@ts-ignore
        myToken.transferFrom(
          user1.address,
          user2.address,
          ethers.utils.parseEther("1")
        )
      ).to.be.revertedWith("MyToken: Insufficient allowance");
    });

    it("Should transferFrom ", async function () {
      await expect(
        await myToken.transfer(user1.address, ethers.utils.parseEther("2"))
      ).to.emit(myToken, "Transfer");

      await expect(
        await myToken
          //@ts-ignore
          .connect(user1)
          .approve(user2.address, ONE_TOKEN)
      ).to.emit(myToken, "Approval");

      await expect(
        await myToken
          //@ts-ignore
          .connect(user2)
          .transferFrom(user1.address, user2.address, ONE_TOKEN)
      ).to.emit(myToken, "Transfer");

      expect(await myToken.balanceOf(user1.address)).eq(ONE_TOKEN);
      expect(await myToken.balanceOf(user2.address)).eq(ONE_TOKEN);
      expect(await myToken.allowance(user1.address, user2.address)).eq(0);
    });

    it("Should burn not enough balance", async () => {
      await expect(
        myToken.burn(ethers.utils.parseEther("200"))
      ).to.be.revertedWith("MyToken: Insufficient balance");
    });

    it("Should allow do burn value", async function () {
      await expect(
        await myToken.transfer(user1.address, ethers.utils.parseEther("4"))
      ).to.emit(myToken, "Transfer");

      await expect(
        //@ts-ignore
        myToken.connect(user1).burn(ethers.utils.parseEther("2"))
      ).to.emit(myToken, "Transfer");

      expect(await myToken.balanceOf(user1.address)).eq(
        ethers.utils.parseEther("2")
      );
      await expect(
        //@ts-ignore
        myToken.connect(user1).burn(ethers.utils.parseEther("2"))
      ).to.emit(myToken, "Transfer");
      expect(await myToken.balanceOf(user1.address)).eq(0);
    });
  });
});
