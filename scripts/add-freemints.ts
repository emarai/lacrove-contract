import { Gas } from "near-units";
import { readFile } from "fs/promises";
import { Context } from "near-cli/context";
import { Contract } from "../contracts/tenk/dist";
import { valid_account_id } from "./utils";

async function isFreeminted(
  contract: Contract,
  account_id: string
): Promise<boolean> {
  try {
    return contract.freeminted({ account_id });
  } catch (e) {
    console.log(e);
    console.log(`Problem with ${account_id}`);
    return true;
  }
}

const DEFAULT_PER_TX = 200;

export async function main({ account, argv }: Context) {
  if (argv.length < 2) {
    console.error(
      `Help:\n<input file> <contractId> <amount per tx? (default ${DEFAULT_PER_TX})>`
    );
    process.exit(1);
  }
  const [file, contractId, number] = argv;
  let freemintedMap = JSON.parse(await readFile(file, "utf8"));
  let whitelist = filter_accounts(Object.keys(freemintedMap));

  let atATime = number ? parseInt(number) : DEFAULT_PER_TX;
  const contract = new Contract(account, contractId);

  for (let i = 0; i < whitelist.length; i = i + atATime) {
    let account_ids = whitelist.slice(i, i + atATime);
    let notInWl = {};
    await Promise.all(
      account_ids.map(async (account_id) => {
        try {
          notInWl[account_id] = freemintedMap[account_id];
        } catch (e) {
          console.error(`issue with account: ${account_id}`);
        }
      })
    );
    const gas = Gas.parse("250 Tgas");
    const accounts = notInWl;
    if (Object.keys(accounts).length > 0) {
      try {
        await contract.add_freemint_accounts({ accounts }, { gas });
      } catch (e) {
        console.log(`Failed ${accounts}`);
        continue;
      }
      console.log(`Added ${accounts}`);
    }
  }
}

function filter_accounts(raw_account_ids: string[]): string[] {
  const account_ids = raw_account_ids.map((s) => s.trim().toLowerCase());
  let invalid_account_ids = account_ids.filter(
    (id) => !valid_account_id.test(id)
  );
  if (invalid_account_ids.length > 0) {
    console.log(`invalid Ids "${invalid_account_ids}"`);
  }
  return account_ids.filter((id) => valid_account_id.test(id));
}
