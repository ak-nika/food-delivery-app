import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { Redirect, Slot } from "expo-router";
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Redirect href="/" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="h-full bg-white"
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="relative w-full"
          style={{ height: Dimensions.get("screen").height / 2.25 }}
        >
          <ImageBackground
            source={images.loginGraphic}
            className="size-full rounded-b-lg"
            style={{
              width: "100%",
              height: "100%",
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
            resizeMode="stretch"
          />

          <Image
            source={images.logo}
            className="absolute -bottom-16 z-10 size-4 self-center"
            style={{
              position: "absolute",
              bottom: -32,
              zIndex: 10,
              width: 128,
              height: 128,
              alignSelf: "center",
            }}
          />
        </View>

        <Slot />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
