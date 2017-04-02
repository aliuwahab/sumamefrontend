(function () {
  'use strict';

  angular
    .module('somameAdmin')
    .factory('UploadService', UploadService);

  /** @ngInject */
  function UploadService($q, $rootScope, localStorageService, ENV) {

    var uploadProgress = 0;
    var uploadRequest;

    var service = {
      uploadFileToS3: uploadFileToS3,
      getUploadProgress: getUploadProgress,
      abortUpload: abortUpload,
      deleteFileFromS3: deleteFileFromS3,
    };

    return service;

    function uploadFileToS3(file, filePurpose, fileType) {

      var deferred = $q.defer();

      var awsS3UserFilesBucket = ENV.awsS3UserFilesBucket + '/' +
      localStorageService.get('profile').id + '/' + filePurpose + '/' + fileType;

      configureAWS();
      var bucket = new AWS.S3({ params: { Bucket: awsS3UserFilesBucket } });

      if (file) {

        // Prepend Unique String To Prevent Overwrites
        var formattedName = file.name.replace(/[^A-Z0-9]+/ig, '_');
        var fileExtension = file.type.split('/')[1];
        var uniqueFileName = uniqueString() + '-' + formattedName + '.' + fileExtension;
        var expectedfileURL = 'https://s3.amazonaws.com/' +
        awsS3UserFilesBucket + '/' + uniqueFileName;

        var params = {
          Key: uniqueFileName,
          ContentType: file.type,
          Body: file,
          ServerSideEncryption: 'AES256',
        };

        uploadRequest = bucket.putObject(params, function (err, data) {
          if (err) {
            deferred.reject(err.message, err.code);
            return false;
          } else {
            // Upload Successfully Finished
            uploadRequest = null;
            deferred.resolve(expectedfileURL);
          }
        })
        .on('httpUploadProgress', function (progress) {
          uploadProgress = Math.round(progress.loaded / progress.total * 100);
          $rootScope.$apply();
        });
      } else {
        // No File Selected
        deferred.reject('Please select a file to upload');
      }

      return deferred.promise;
    };

    function deleteFileFromS3(fileURL) {
      configureAWS();
      var fileParts = splitAWSFileURL(fileURL);

      var bucket = new AWS.S3({ params: { Bucket: fileParts.bucket } });

      debugger;

      bucket.deleteObject({ Key: fileParts.fileKey }, function (err, data) {
        if (err) {
          return false;
        } else {
          return true;
        }
      });
    };

    function configureAWS() {
      AWS.config.update({
        accessKeyId: ENV.awsAccessKeyId,
        secretAccessKey: ENV.awsSecretAccessKey,
      });
      AWS.config.region = 'us-east-1';
    }

    function splitAWSFileURL(fileURL) {
      var awsURLRoot = 'https://s3.amazonaws.com/';
      var bucketAndKey = fileURL.substr(fileURL.indexOf(awsURLRoot) +
      awsURLRoot.length, fileURL.length);

      var fileName = bucketAndKey.split('/').pop();
      var bucketName = bucketAndKey.substr(0, bucketAndKey.indexOf(fileName)).slice(0, -1);

      return {
        fileKey: fileName,
        bucket: bucketName,
      };
    }

    function uniqueString() {
      var text     = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      return text;
    };

    function getUploadProgress() {
      return uploadProgress;
    }

    function abortUpload() {
      if (uploadRequest) {
        uploadRequest.abort();
      }
    }

  }
})();
