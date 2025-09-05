import { CreateUserParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  ID,
  Query,
  TablesDB,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.nika.foodordering",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "68b7084c00339f9967b9",
  tableId: "user",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const avatars = new Avatars(client);

export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if (!newAccount) throw new Error("Failed to create account");

    await signIn({ email, password });

    const avatarUrl = await avatars.getInitialsURL(name);

    return await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.tableId,
      ID.unique(),
      { account_id: newAccount.$id, email, name, avatar: avatarUrl },
    );
  } catch (error) {
    throw new Error(error as string);
  }
};

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    await account.createEmailPasswordSession(email, password);
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No user logged in");

    const user = await tablesDB.listRows(
      appwriteConfig.databaseId,
      appwriteConfig.tableId,
      [Query.equal("account_id", currentAccount.$id)],
    );
    if (!user.total) throw new Error("User not found");

    return user.rows[0];
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};
