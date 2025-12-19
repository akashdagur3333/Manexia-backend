const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Role = require('../role/role.model');
const Organization = require('../organization/organization.model');
const mongoose = require('mongoose');
const convertObjectId = require('../../shared/utils/convertObjectId.util');

exports.register = async ({ name, email, password, orgName,role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');

  const org = await Organization.create({ name: orgName });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role:{roleId:role.roleId,name:role.name},
    organization: {orgId:org._id,name:org.name}
  });

  return { message: 'Registered successfully' };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Invalid credentials');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');
  const role = await Role.findById(
    convertObjectId(user.role.roleId)
  );  
  console.log( convertObjectId(user.role.roleId))
  let permissions=role.permissions.includes('*') ? "SUPER_ADMIN":role.permissions;
  const token = jwt.sign(
    { userId: user._id, organization:{ orgId:user.organization.orgId,name:user.organization.name},name:user.name,email:user.email, roleId: role._id,
    permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token };
};
