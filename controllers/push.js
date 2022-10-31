// import post schemna
const Push = require("../models/push");
const { Expo } = require("expo-server-sdk");

exports.saveToken = async (req, res) => {
  //destructure the body data

  const { token } = req.body;

  const newToken = new Push({
    token,
    status: 1,
  });

  //check if post already exists with slug

  const isAlreadyExists = await Push.findOne({ token });
  if (isAlreadyExists) {
    return res.json({
      error: "Token already saved, save another",
    });
  } else {
    // console.log("req.file", req.file);

    console.log("newtoken", newToken);

    await newToken.save();

    // return res.json({post: newPost});

    return res.json({
      push: {
        id: newToken._id,
        token: newToken.token,
        status: 1,
      },
    });
  }
};

// exports.deletePost = async (req, res) => {
//   // get the url params

//   const {
//     title,
//     content,
//     meta,
//     slug,
//     tags,
//     author,
//     likeCount,
//     commentCount,
//     featured,
//   } = req.body;

//   const { file } = req;

//   const { postId } = req.params;
//   if (!isValidObjectId(postId))
//     return res.status(401).json({ error: "Invalid Request!" });

//   // find post
//   const post = await Post.findById(postId);
//   if (!post) return res.status(404).json({ error: "No post found!" });

//   //   check if posts has a thumbnail
//   const public_id = post.thumbnail?.public_id;
//   if (public_id) {
//     // remove thumbnail from clodinary
//     const { result, error } = await cloudinary.uploader.destroy(public_id);
//     if (result !== "ok")
//       return res
//         .status(404)
//         .json({ error: "Could not remove thumbnail from cloudinary!" });
//   }

//   await Post.findByIdAndDelete(postId);

//   //

//   await removeFromFeaturedPost(postId);

//   //
//   res.json({ message: "Post Deleted Successfully!" });
// };

exports.getTokens = async (req, res) => {
  const { pageNo = 0, limit = 10 } = req.query;
  const tokens = await Push.find({})
    .sort({ createdAt: -1 })
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  const postCount = await Push.countDocuments();

  res.json({
    tokens: tokens.map((push) => ({
      id: push._id,
      token: push.token,

      createdAt: push.createdAt,

      //   featured,
    })),
    postCount,
  });
};

exports.sendPush = async (req, res) => {
  const { message, title } = req.body;

  //get all push tokens

  const allTokens = await Push.find({ status: 1 });
  const pushCount = allTokens.length;

  // Create the messages that you want to send to clients

  // optionally providing an access token if you have enabled push security
  // let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  let expo = new Expo();
  let messages = [];

  for (let pushToken of allTokens) {
    // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken.token)) {
      console.error(
        `Push token ${pushToken.token} is not a valid Expo push token`
      );
      continue;
    }
    // console.log("pushToken.token", pushToken.token);
    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    messages.push({
      to: pushToken.token,
      sound: "default",
      title: title,
      body: message,
      data: { token: pushToken.token },
    });
  }

  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  (async () => {
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        // console.log('typ', typeof chunk);
        // const searchObject = chunk.find((car) => car.model=="X5");
        // console.log('typ', chunk);
        // console.log("ticketChunk", ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
        //subbject to test
        // if (details && details.error) {
        //   // The error codes are listed in the Expo documentation:
        //   // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        //   // You must handle the errors appropriately.
        //   console.error(`The error code is ${details.error}`);
        //   //
        //   if (details.error === "DeviceNotRegistered") {
        //     // console.log(details);
        //     const nP = Push.findOne({ token: messages.to });
        //     Push.status = 0;
        //     Push.save();
        //   }
        // }
      }
    }
  })();

  let receiptIds = [];
  for (let ticket of tickets) {
    // NOTE: Not all tickets have IDs; for example, tickets for notifications
    // that could not be enqueued will have error information and no receipt ID.
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log("rrrr", receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
              if (details.error === "DeviceNotRegistered") {
                console.log(details);
                // Push.findOne({token: })
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();

  // return res.json({ title, message, allTokens, pushCount });
  return res.json({ post: { title, message, allTokens, pushCount } });
};

exports.updateTokenStatus = async (req, res) => {
  const { token, status } = req.body;

  const thisToken = await Push.findOne({ token: token });

  if (status === 1) {
    thisToken.status = 1;
    thisToken.save();
  } else {
    thisToken.status = 0;
    thisToken.save();
  }

  return res.json({ message: thisToken });
};
