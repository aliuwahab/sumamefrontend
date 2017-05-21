// Shared env vars in all environments
var shared = {
  stage: process.env.STAGE,
  apiBaseURL: process.env.API_BASE_URL,
  absoluteApiBaseURL: process.env.ABSOLUTE_API_BASE_URL,
  rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  segmentWriteKey: process.env.SEGMENT_WRITE_KEY,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsS3UserFilesBucket: process.env.AWS_S3_USER_FILES_BUCKET,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  pusherApiKey: process.env.PUSHER_API_KEY,
  fakerAPIBaseURL: process.env.FAKER_API_BASE_URL,
  debug: process.env.DEBUG || false,
};

// Mashup of all ENV Vars
var environments = {
  development: {
    ENV: shared,
  },
  nabong: {
    ENV: shared,
  },
  staging: {
    ENV: shared,
  },
  production: {
    ENV: shared,
  },
};
environments.production.buildpack  = process.env.BUILDPACK_URL;

module.exports = environments;
