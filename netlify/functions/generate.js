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
    const { youtubeUrl } = JSON.parse(event.body);

    const id = Math.random().toString(36).substring(2, 8);
    const expiry = Date.now() + 10 * 60 * 1000;

    await db.collection("links").doc(id).set({
      youtubeUrl,
      expiry
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        shortLink: `${process.env.URL}/.netlify/functions/view?id=${id}`
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: err.toString()
    };
  }
};
