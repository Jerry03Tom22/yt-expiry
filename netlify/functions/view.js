const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_KEY)
    )
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters.id;

    const doc = await db.collection("links").doc(id).get();

    if (!doc.exists) {
      return {
        statusCode: 404,
        body: "Link not found"
      };
    }

    const data = doc.data();

    if (Date.now() > data.expiry) {
      return {
        statusCode: 403,
        body: "Link expired"
      };
    }

    return {
      statusCode: 302,
      headers: {
        Location: data.youtubeUrl
      }
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: err.toString()
    };
  }
};
