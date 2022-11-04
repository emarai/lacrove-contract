import { NEAR, Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import * as tenk from "../contracts/tenk/dist";
import { binPath } from "./utils";
import { icon } from "./icon";

const metadata: tenk.InitialMetadata = {
  uri: "https://bafybeicbqphe6h6axkkbfh2wlfo2cs5sy46cnh24csfepgtmlz7hrgyzzu.ipfs.dweb.link",
  name: "Lacrove",
  symbol: "LACROVE",
  icon,
};

const size = 1234;

const sale: tenk.Sale = {
  price: NEAR.parse("10 N").toJSON(),
  presale_price: NEAR.parse("9 N").toJSON(),
  mint_rate_limit: 5,
  presale_start: Date.parse("27 September 2022 11:59 PM UTC+7"),
  public_sale_start: Date.parse("28 September 2022 11:59 PM UTC+7"),
  // initial_royalties: {
  //   percent: 10_000,
  //   accounts: {
  //     "tenk.sputnik-dao.near": 2_000,
  //     "project.sputnik-dao.near": 2_000,
  //     "mistcop.near": 6_000,
  //   },
  // },
  royalties: {
    percent: 500,
    accounts: {
      "lacrove.near": 10_000,
    },
  },
};

export async function main({ account, nearAPI, argv, near }: Context) {
  let { Account } = nearAPI;
  const contractBytes = await readFile(binPath("tenk"));

  let [contractId] = argv ?? [];
  contractId = contractId ?? account.accountId;
  let contractAccount = new Account(near.connection, contractId);

  const isTestnet =
    contractId.endsWith("testnet") || contractId.startsWith("dev-");

  const initialArgs = {
    owner_id: account.accountId,
    metadata,
    size,
    sale,
  };

  const contract = new tenk.Contract(account, contractId);

  const tx = account
    .createTransaction(contractId)
    .deployContract(contractBytes);

  console.log(`initializing with: \n${JSON.stringify(initialArgs, null, 2)}`);
  tx.actions.push(
    contract.new_default_metaTx(initialArgs, { gas: Gas.parse("50Tgas") })
  );
  let res = await tx.signAndSend();
  console.log(
    `https://explorer${isTestnet ? ".testnet" : ""}.near.org/transactions/${
      res.transaction_outcome.id
    }`
  );
  //@ts-ignore
  if (res.status.SuccessValue != undefined) {
    console.log(`deployed ${contractId}`);
  } else {
    console.log(res);
  }
}
