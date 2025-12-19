const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Organization = require('../organization/organization.model');

exports.register = async ({ name, email, password, orgName }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');

  const org = await Organization.create({ name: orgName });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    orgId: org._id
  });

  return { message: 'Registered successfully' };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user._id, orgId: user.orgId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token };
};
