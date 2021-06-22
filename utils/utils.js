module.exports.isFacePresent = (detection) => {
  const labels =
    detection.Labels.length > 0 ? detection.Labels.map((o) => o.Name) : [];
  return ["Human", "Person", "Face"].every((item) => labels.includes(item));
};

module.exports.isFaceStraight = (face, threshold = 10) => {
  for (const iterator in face.Pose) {
    if (-threshold > face.Pose[iterator] || face.Pose[iterator] > threshold)
      return false;
  }
  return true;
};

module.exports.processLandmarks = (detection) => {
  let err = false,
    message = "";
  if (detection.FaceDetails.length > 1)
    return this.generateError("multiple faces detected");

  const face = detection.FaceDetails[0];

  if (!this.isFaceStraight(face))
    return this.generateError("face is not straight (tilted)");

  return { err, message };
};

module.exports.generateError = (message) => {
  return { err: true, message };
};
