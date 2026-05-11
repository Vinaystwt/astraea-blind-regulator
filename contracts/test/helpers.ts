import { FhevmType } from "@fhevm/hardhat-plugin";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import type { Interface, Signer } from "ethers";
import * as hre from "hardhat";

chai.use(chaiAsPromised);

export type TestContract = any;

export async function deployContract(name: string, signer: HardhatEthersSigner, args: unknown[]): Promise<TestContract>;
export async function deployContract(name: string, signer: HardhatEthersSigner, args: unknown[] = []): Promise<TestContract> {
  const factory = await hre.ethers.getContractFactory(name);
  const contract = await factory.connect(signer).deploy(...args);
  await contract.waitForDeployment();
  await hre.fhevm.assertCoprocessorInitialized(contract, name);
  return contract as TestContract;
}

export async function encrypt64(contractAddress: string, user: HardhatEthersSigner, value: bigint | number) {
  const input = hre.fhevm.createEncryptedInput(contractAddress, user.address);
  input.add64(value);
  const encrypted = await input.encrypt();
  return {
    handle: encrypted.handles[0],
    proof: encrypted.inputProof
  };
}

export async function submitAmount(contract: TestContract, user: HardhatEthersSigner, value: bigint | number) {
  const contractAddress = await contract.getAddress();
  const encrypted = await encrypt64(contractAddress, user, value);
  const tx = await contract.connect(user).submit(encrypted.handle, encrypted.proof);
  return tx.wait();
}

export async function decryptBool(handle: string, contract: TestContract, user: HardhatEthersSigner) {
  return hre.fhevm.userDecryptEbool(handle, await contract.getAddress(), user as unknown as Signer);
}

export async function decrypt8(handle: string, contract: TestContract, user: HardhatEthersSigner) {
  return hre.fhevm.userDecryptEuint(FhevmType.euint8, handle, await contract.getAddress(), user as unknown as Signer);
}

export async function decrypt64(handle: string, contract: TestContract, user: HardhatEthersSigner) {
  return hre.fhevm.userDecryptEuint(FhevmType.euint64, handle, await contract.getAddress(), user as unknown as Signer);
}

export function parseContractEvents(receipt: { logs?: readonly unknown[] }, iface: Interface) {
  return (receipt.logs ?? [])
    .map((log) => {
      try {
        return iface.parseLog(log as Parameters<Interface["parseLog"]>[0]);
      } catch {
        return null;
      }
    })
    .filter((event) => event !== null);
}

export function expectNoPrivateEventLeak(
  receipt: { logs?: readonly unknown[] },
  iface: Interface,
  forbidden: Array<string | number | bigint>
) {
  const events = parseContractEvents(receipt, iface);

  for (const event of events) {
    for (const input of event!.fragment.inputs) {
      expect(input.type).to.not.equal("bool");
    }
  }

  const publicArgs = events.flatMap((event) => event!.args.map((arg) => (typeof arg === "bigint" ? arg.toString() : String(arg))));

  for (const value of forbidden) {
    expect(publicArgs).to.not.include(String(value));
  }
  const text = JSON.stringify(publicArgs);
  expect(text.toLowerCase()).to.not.include("approved");
  expect(text.toLowerCase()).to.not.include("rejected");
}
