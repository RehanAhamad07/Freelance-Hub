require('dotenv').config();
const { sendPasswordResetOtp } = require('./utils/email');

(async () => {
  console.log("Testing email...");
  const success = await sendPasswordResetOtp("test@example.com", "123456");
  console.log("Success:", success);
})();
