const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters.id;

    const doc = await db.collection("links").doc(id).get();

    if (!doc.exists) {
      return { statusCode: 404, body: "Link not found" };
    }

    const data = doc.data();

    if (Date.now() > data.expiry) {
      return { statusCode: 403, body: "Link expired" };
    }

    const url = data.youtubeUrl;

    let youtubeId = null;

    if (url.includes("v=")) {
      youtubeId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      youtubeId = url.split("youtu.be/")[1].split("?")[0];
    }

    if (!youtubeId) {
      return { statusCode: 400, body: "Invalid YouTube URL" };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ youtubeId })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: err.toString()
    };
  }
};
