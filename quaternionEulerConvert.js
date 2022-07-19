// https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles

class Quaternion {
  constructor(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
};

class EulerAngles {
  constructor(yaw, pitch, roll) {
    this.yaw = yaw;
    this.pitch = pitch;
    this.roll = roll;
  }
};

export function toQuaternion(yaw, pitch, roll) {
    // Abbreviations for the various angular functions
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);

    const q = new Quaternion(0, 0, 0, 1);
    q.w = cr * cp * cy + sr * sp * sy;
    q.x = sr * cp * cy - cr * sp * sy;
    q.y = cr * sp * cy + sr * cp * sy;
    q.z = cr * cp * sy - sr * sp * cy;

    return q;
}

export function toEulerAngles(x, y, z, w) {
  const q = new Quaternion(x, y, z, w);
  const angles = new EulerAngles(0, 0, 0);

  // roll (x-axis rotation)
  const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
  const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
  angles.roll = Math.atan2(sinr_cosp, cosr_cosp);

  // pitch (y-axis rotation)
  const sinp = 2 * (q.w * q.y - q.z * q.x);
  if (Math.abs(sinp) >= 1) {
    angles.pitch = Math.PI / 2 * Math.sign(sinp);
  } else {
    angles.pitch = Math.asin(sinp);
  }

  // yaw (z-axis rotation)
  const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
  const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  angles.yaw = Math.atan2(siny_cosp, cosy_cosp);

  return angles;
}
