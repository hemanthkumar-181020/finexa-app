import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

// Your project number
const PROJECT_NUMBER = "898226239130";

/**
 * 🔔 Runs every minute
 * Sends push notifications for due reminders
 */
export const reminderScheduler = onSchedule(
  {
    schedule: "* * * * *",
    region: "asia-south1", // or your preferred region
    timeoutSeconds: 540,
    memory: "512MiB",
  },
  async (event) => {
    console.log(`Reminder scheduler triggered at ${new Date().toISOString()}`);
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db
      .collection("reminders")
      .where("remindAt", "<=", now)
      .where("notified", "==", false)
      .get();

    if (snapshot.empty) {
      console.log("No reminders to notify");
      return;
    }

    let notificationsSent = 0;
    for (const doc of snapshot.docs) {
      const reminder = doc.data() as {
        title: string;
        userId: string;
        [key: string]: any;
      };

      try {
        const userDoc = await db.collection("users").doc(reminder.userId).get();
        const userData = userDoc.data() as { fcmToken?: string } | undefined;
        const token = userData?.fcmToken;

        if (!token) {
          console.log("No FCM token for user:", reminder.userId);
          continue;
        }

        await messaging.send({
          notification: {
            title: "⏰ Reminder",
            body: reminder.title,
            sound: "default",
          },
          token,
        });

        await doc.ref.update({
          notified: true,
          notifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Notification sent: ${reminder.title} for user ${reminder.userId}`);
        notificationsSent++;
      } catch (err) {
        console.error(`Error sending notification for reminder ${doc.id}:`, err);
      }
    }
    console.log(`Processed ${snapshot.size} reminders, sent ${notificationsSent} notifications`);
  }
);

/**
 * 🗑 Auto-delete completed reminders
 * Triggered whenever a reminder is updated to completed
 */
export const deleteCompletedReminders = onDocumentUpdated(
  {
    document: "reminders/{reminderId}",
    region: "asia-south1",
  },
  async (event) => {
    if (!event.data) {
      console.log("No event data");
      return;
    }

    const before = event.data.before.data() as { completed?: boolean } | undefined;
    const after = event.data.after.data() as { completed?: boolean } | undefined;

    if (!before?.completed && after?.completed) {
      try {
        await event.data.after.ref.delete();
        console.log(`Deleted completed reminder ${event.params.reminderId}`);
      } catch (err) {
        console.error(`Error deleting reminder ${event.params.reminderId}:`, err);
      }
    }
  }
);

/**
 * ⏰ Daily cleanup for any missed completed reminders
 */
export const dailyCleanupCompletedReminders = onSchedule(
  {
    schedule: "every 24 hours",
    region: "asia-south1",
    timeoutSeconds: 540,
  },
  async (event) => {
    console.log("Daily cleanup started");
    const snapshot = await db
      .collection("reminders")
      .where("completed", "==", true)
      .get();

    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      console.log(`Deleted ${snapshot.size} completed reminders`);
    } else {
      console.log("No completed reminders to clean up");
    }
  }
);
