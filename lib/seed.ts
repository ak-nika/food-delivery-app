import * as FileSystem from "expo-file-system";
import { ID } from "react-native-appwrite";
import { appwriteConfig, storage, tablesDB } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customisations: string[]; // list of customisation names
}

interface DummyData {
  categories: Category[];
  customisations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

function getMimeType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream"; // fallback
  }
}

async function clearAll(collectionId: string): Promise<void> {
  const list = await tablesDB.listRows(appwriteConfig.databaseId, collectionId);

  await Promise.all(
    list.rows.map((doc) =>
      tablesDB.deleteRow(appwriteConfig.databaseId, collectionId, doc.$id),
    ),
  );
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id),
    ),
  );
}

async function uploadImageToStorage(imageUrl: string) {
  const fileName = imageUrl.split("/").pop() || `file-${Date.now()}.jpg`;
  const mimeType = getMimeType(fileName);
  const localPath = FileSystem.cacheDirectory + fileName;

  const downloadRes = await FileSystem.downloadAsync(imageUrl, localPath);

  const fileInfo = await FileSystem.getInfoAsync(downloadRes.uri);
  if (!fileInfo.exists || !fileInfo.size) {
    throw new Error("Failed to download image");
  }

  const fileObj = {
    name: fileName,
    type: mimeType,
    size: fileInfo.size,
    uri: downloadRes.uri,
  };

  const file = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    fileObj,
  );

  return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
}

async function seed(): Promise<void> {
  console.log("🌱 Starting seeding process...");

  // 1. Clear all
  await clearAll(appwriteConfig.categoriesTableId);
  await clearAll(appwriteConfig.customisationsTableId);
  await clearAll(appwriteConfig.menuTableId);
  await clearAll(appwriteConfig.menuCustomisationsTableId);
  await clearStorage();

  // 2. Create Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    const doc = await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesTableId,
      ID.unique(),
      cat,
    );
    categoryMap[cat.name] = doc.$id;
  }

  // 3. Create Customisations
  const customisationMap: Record<string, string> = {};
  for (const cus of data.customisations) {
    const doc = await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.customisationsTableId,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      },
    );
    customisationMap[cus.name] = doc.$id;
  }

  // 4. Create Menu Items
  const menuMap: Record<string, string> = {};
  for (const item of data.menu) {
    const uploadedImage = await uploadImageToStorage(item.image_url);

    const doc = await tablesDB.createRow(
      appwriteConfig.databaseId,
      appwriteConfig.menuTableId,
      ID.unique(),
      {
        name: item.name,
        description: item.description,
        image_url: uploadedImage,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryMap[item.category_name],
      },
    );

    menuMap[item.name] = doc.$id;

    // 5. Create menu_customizations
    for (const cusName of item.customisations) {
      await tablesDB.createRow(
        appwriteConfig.databaseId,
        appwriteConfig.menuCustomisationsTableId,
        ID.unique(),
        {
          menu: doc.$id,
          customisations: customisationMap[cusName],
        },
      );
    }
  }

  console.log("✅ Seeding complete.");
}

export default seed;
