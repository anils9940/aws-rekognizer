const AWSConfig = require("aws-sdk").config;
const Rekognition = require("aws-sdk").Rekognition;
let r = new Rekognition();
r.detectFaces();
const utils = require("./utils/utils");

class FaceProcessor {

  constructor(config) {
    AWSConfig.update({
      region: config.REGION,
      accessKeyId: config.ACCESS_KEY_ID,
      secretAccessKey: config.SECRET_ACCESS_KEY,
    });

    this.rekognition = new Rekognition();
    this.maxLabels = 10;
    this.minConfidence = 99;
    this.faceDetectionAttributes = ["ALL"];
  }

  generateError(message) {
    return { err: true, message };
  }

  async execute(name, params) {
    return new Promise((resolve, reject) =>
      this.rekognition[name](params, (err, res) =>
        err ? reject(err) : resolve(res)
      )
    );
  }

  async processImage(params) {
    let { err, message } = [false, ""];
    let labelParams = Object.assign(
      { MaxLabels: this.maxLabels, MinConfidence: this.minConfidence },
      params
    );
    const labels = await Promise.all([
      this.execute("detectLabels", labelParams),
    ]);
    const isFace = utils.isFacePresent(labels[0]);
    if (!isFace) return utils.generateError("no faces found");

    let faceParams = Object.assign(
      { Attributes: this.faceDetectionAttributes },
      params
    );
    const faces = await Promise.all([this.execute("detectFaces", faceParams)]);
    ({ err, message } = utils.processLandmarks(faces[0]));

    return { err, message };
  }
}

module.exports.FaceProcessor = FaceProcessor;
