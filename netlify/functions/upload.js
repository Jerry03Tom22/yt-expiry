const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)),
    storageBucket: "YOUR_PROJECT_ID.appspot.com"
  });
}

exports.handler = async (event) => {
  const { filename, expiryMinutes } = JSON.parse(event.body);

  const id = uuidv4();
  const filePath = `videos/${id}-${filename}`;

  const bucket = admin.storage().bucket();
  const file = bucket.file(filePath);

  const uploadUrl = await file.getSignedUrl({
    action: "write",
    expires: Date.now() + 10 * 60 * 1000,
    contentType: "video/mp4"
  });

  const expiresAt = Date.now() + expiryMinutes * 60 * 1000;

  await admin.firestore().collection("videos").doc(id).set({
    videoPath: filePath,
    expiresAt: expiresAt
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: uploadUrl[0],
      id: id
    })
  };
};
