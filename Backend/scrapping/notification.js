const nodemailer = require('nodemailer');
const User = require('../models/User')
const Notification = require('../models/Notification')

async function sendNotification() {

  const notification_array = await Notification.find({
    source: "0"
  })

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });

  if (notification_array.length == 0) {
    console.log("Notifications array is empty")
    return
  }
  notification_array.forEach(notif => {

    let htmlText = `Check this link : <a href=\"${notif.url}\">Link</a>`;
    let textToSend = `${notif.title} might interest you. `;

    User.findById(notif.user_id, function (err, user) {
      if (err) {
        console.log(err);
      } else {

        try {
          let info = transporter.sendMail({
            from: process.env.EMAIL,
            to: user.email,
            subject: notif.title,
            text: textToSend,
            html: htmlText
          });

          console.log("Message sent to " + user.email);

          Notification.findOneAndDelete({
            "_id": notif.id
          }, function (error, docs) {
            if (error) {
              console.log(error);
            } else {
              console.log("notification deleted")
              console.log(docs);
            }
          });

        } catch (error) {
          console.log(error);
        }
      }
    });
  });
}


module.exports = sendNotification;