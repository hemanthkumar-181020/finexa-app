import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export async function registerForPushNotifications() {
  if (!Device.isDevice) return;

  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (status !== "granted") {
    const res = await Notifications.requestPermissionsAsync();
    finalStatus = res.status;
  }

  if (finalStatus !== "granted") return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  const user = auth.currentUser;
  if (!user) return;

  await setDoc(
    doc(db, "users", user.uid),
    { expoPushToken: token },
    { merge: true }
  );
}
