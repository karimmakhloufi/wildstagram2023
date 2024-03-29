import React, { useRef } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { Camera } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

export default function CameraScreen() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  return (
    <>
      <Camera style={styles.camera} ref={cameraRef} />
      <Button
        title="Take a picture"
        onPress={async () => {
          if (cameraRef.current) {
            const pictureMetadata = await cameraRef.current.takePictureAsync();
            console.log("pictureMetadata", pictureMetadata);
            const resizedImageMetadata = await ImageManipulator.manipulateAsync(
              pictureMetadata.uri,
              [{ resize: { width: 800 } }],
              { base64: true } // because of a bug with imagemanipulator or expo go, we output the resized image as base64 format
            );
            try {
              // we check if the photos directory exists in the folder where the user can write
              const photosMetadata = await FileSystem.getInfoAsync(
                FileSystem.documentDirectory + "photos"
              );
              if (photosMetadata.exists === false) {
                // if the directory does not exist, we create it
                await FileSystem.makeDirectoryAsync(
                  FileSystem.documentDirectory + "photos"
                );
              }
              console.log(
                // we write the base64 file in the photos directory
                await FileSystem.writeAsStringAsync(
                  FileSystem.documentDirectory +
                    "photos/" +
                    resizedImageMetadata.uri.split("/").at(-1), // we get the original file name by making a split in the filename and taking the last element of the array
                  resizedImageMetadata.base64,
                  {
                    encoding: FileSystem.EncodingType.Base64,
                  }
                )
              );
            } catch (err) {
              console.log("error", err);
            }
          } else {
            console.log("Error while taking picture");
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
