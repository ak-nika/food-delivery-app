import { MenuItem } from "@/type";
import React from "react";
import { Image, Platform, Text, TouchableOpacity } from "react-native";

const MenuCard = ({ item: { name, image_url, price } }: { item: MenuItem }) => {
  return (
    <TouchableOpacity
      className="menu-card"
      style={
        Platform.OS === "android"
          ? { elevation: 10, shadowColor: "#878787" }
          : {}
      }
    >
      <Image
        source={{ uri: image_url }}
        className="absolute -top-10 size-32"
        style={{ position: "absolute", top: -40, width: 128, height: 128 }}
        resizeMode="contain"
      />

      <Text
        className="base-bold mb-2 text-center text-dark-100"
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text className="body-regular mb-4 text-gray-200">From ${price}</Text>

      <TouchableOpacity onPress={() => {}}>
        <Text className="paragraph-bold text-primary">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default MenuCard;
