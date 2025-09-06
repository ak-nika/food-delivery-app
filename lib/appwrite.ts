import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  ID,
  Query,
  Storage,
  TablesDB,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: "com.nika.foodordering",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "68b7084c00339f9967b9",
  bucketId: "68bb1f86000d8b660afd",
  userTableId: "user",
  categoriesTableId: "categories",
  menuTableId: "menu",
  customisationsTableId: "customisations",
  menuCustomisationsTableId: "menu_customisations",
};

export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);
export const avatars = new Avatars(client);
export const storage = new Storage(client);

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
      appwriteConfig.userTableId,
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
      appwriteConfig.userTableId,
      [Query.equal("account_id", currentAccount.$id)],
    );
    if (!user.total) throw new Error("User not found");

    return user.rows[0];
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};

export const getMenu = async ({ category, query, limit }: GetMenuParams) => {
  try {
    const queries: string[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));
    if (limit) queries.push(Query.limit(limit));

    const menus = await tablesDB.listRows(
      appwriteConfig.databaseId,
      appwriteConfig.menuTableId,
      queries,
    );

    return menus.rows;
  } catch (error) {
    throw new Error(error as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await tablesDB.listRows(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesTableId,
    );

    return categories.rows;
  } catch (error) {
    throw new Error(error as string);
  }
};
