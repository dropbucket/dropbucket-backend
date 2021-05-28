import jwt_decode from 'jwt-decode';

export const me = async function (req) {
  if (req.headers && req.headers.authorization) {
    let authorization = req.headers.authorization.split(' ')[1],
      decoded;
    try {
      decoded = jwt_decode(authorization);
    } catch (e) {
      return { statusCode: 401, msg: 'unauthorized' };
    }
    let userId = decoded.user_id;
    // Fetch the user by id
    return { statusCode: 200, userId: userId };
  }
  return { statusCode: 500, msg: 'Header error' };
};
