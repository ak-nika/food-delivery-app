import CartButton from "@/components/CartButton";
import { images, offers } from "@/constants";
import cn from "clsx";
import { Fragment } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={offers}
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;

          return (
            <View>
              <Pressable
                className={cn(
                  "offer-card",
                  isEven ? "flex-row-reverse" : "flex-row",
                )}
                style={{ backgroundColor: item.color }}
                android_ripple={{ color: "#ffffff22" }}
              >
                {({ pressed }) => (
                  <Fragment>
                    <View className="h-full w-1/2">
                      <Image
                        source={item.image}
                        className="size-full"
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="contain"
                      />
                    </View>

                    <View
                      className={cn(
                        "offer-card__info",
                        isEven ? "pl-10" : "pr-10",
                      )}
                    >
                      <Text className="h1-bold leading-tight text-white">
                        {item.title}
                      </Text>

                      <Image
                        source={images.arrowRight}
                        className="size-10"
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                        tintColor="#ffffff"
                      />
                    </View>
                  </Fragment>
                )}
              </Pressable>
            </View>
          );
        }}
        contentContainerClassName="pb-28 px-5"
        ListHeaderComponent={() => (
          <View className="flex-between my-5 flex-row">
            <View className="flex-start">
              <Text className="small-bold uppercase text-primary">
                Deliver to
              </Text>
              <TouchableOpacity className="flex-center mt-0.5 flex-row gap-x-1">
                <Text className="paragraph-bold text-dark-100">Nigeria</Text>
                <Image
                  source={images.arrowDown}
                  className="size-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <CartButton />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
