const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_KEY)),
    storageBucket: "YOUR_PROJECT_ID.appspot.com"
  });
}

exports.handler = async (event) => {
  const id = event.queryStringParameters.id;

  const doc = await admin.firestore().collection("videos").doc(id).get();

  if (!doc.exists) {
    return { statusCode: 404, body: "Not found" };
  }

  const data = doc.data();

  if (Date.now() > data.expiresAt) {
    return { statusCode: 403, body: "Expired" };
  }

  const file = admin.storage().bucket().file(data.videoPath);

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 5 * 60 * 1000
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ url })
  };
};
