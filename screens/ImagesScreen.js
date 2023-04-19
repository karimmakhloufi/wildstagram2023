import * as FileSystem from "expo-file-system";
import React, { useCallback, useState } from "react";
import { StyleSheet, Image, FlatList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export default function ImagesScreen() {
  const [imagesURI, setImagesURI] = useState([]);
  useFocusEffect(
    useCallback(() => {
      (async () => {
        // we get the photos from the photos directory instead of the imagemanipulator cache
        const images = await FileSystem.readDirectoryAsync(
          FileSystem.documentDirectory + "photos"
        );
        setImagesURI(images);
      })();
    }, [])
  );
  return imagesURI.length > 0 ? (
    <FlatList
      data={imagesURI}
      keyExtractor={(imageURI) => imageURI}
      renderItem={(itemData) => {
        console.log("item", itemData);
        return (
          <Image
            style={styles.image}
            source={{
              uri: FileSystem.documentDirectory + "photos/" + itemData.item,
            }}
          />
        );
      }}
    />
  ) : null;
}

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
    height: 500,
  },
});
