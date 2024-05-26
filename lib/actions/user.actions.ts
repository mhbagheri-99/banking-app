"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const { APPWRITE_DATABASE_ID, APPWRITE_BANK_COLLECTION_ID, APPWRITE_USER_COLLECTION_ID } = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();
    const user = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error(error);
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(
      email,
      password,
    );

    cookies().set("my-custom-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    const user = await getUserInfo({ userId: session.userId });
    return parseStringify(user);
  } catch (error) {
    console.error(error);
  }
};

export const signUp = async ({password, ...userData}: SignUpParams) => {
  let newUserAccount;

  try {
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      userData.email,
      password,
      `${userData.firstName} ${userData.lastName}`,
    );
    
    if (!newUserAccount) throw new Error("Failed to create user account");

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: "personal",
    })

    if (!dwollaCustomerUrl) throw new Error("Failed to create dwolla customer");

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      APPWRITE_DATABASE_ID!, 
      APPWRITE_USER_COLLECTION_ID!, 
      ID.unique(), 
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      },
    )

    const session = await account.createEmailPasswordSession(
      userData.email,
      password,
    );

    cookies().set("my-custom-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    return parseStringify(newUser);
  } catch (error) {
    console.error(error);
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    const user = await getUserInfo({ userId: result.$id });
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logout = async () => {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession("current");
    cookies().delete("my-custom-session");
  } catch (error) {
    return null;
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ["auth"] as Products[],
      language: "en",
      country_codes: ["US"] as CountryCode[],
      }
      const response = await plaidClient.linkTokenCreate(tokenParams);
      return parseStringify({ linkToken: response.data.link_token });
  } catch (error) {
    console.error(error);
  }
}

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      APPWRITE_DATABASE_ID!,
      // APPWRITE_USER_COLLECTION_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      }
    )

    return parseStringify(bankAccount);
  } catch (error) {
    console.log(error);
  }
}

export const exchangePublicToken = async ({ publicToken, user }: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const itemId = response.data.item_id;
    const accessToken = response.data.access_token;
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    const accountData = accountsResponse.data.accounts[0];
    const request: ProcessorTokenCreateRequest ={
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };
    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });
    if (!fundingSourceUrl) throw new Error("Failed to add funding source");
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

    revalidatePath("/");
    return parseStringify({ publicTokenExchange: "complete" });
  } catch (error) {
    console.error(error);
  }
}

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    )

    return parseStringify(banks.documents);
  } catch (error) {
    console.log(error)
  }
}

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal('$id', [documentId])]
    )

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal('accountId', [accountId])]
    )

    if(bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}
