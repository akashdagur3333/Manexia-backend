const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const Role = require('../role/role.model');
const Organization = require('../organization/organization.model');
const mongoose = require('mongoose');
const convertObjectId = require('../../shared/utils/convertObjectId.util');

exports.register = async ({ name, email, password,organization,role,status}) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    status:status,
    role:{roleId:role._id,name:role.name},
    organization: {orgId:organization._id,name:organization.name}
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
  let permissions=role.permissions.includes('*') ? "SUPER_ADMIN":role.permissions;
  const token = jwt.sign(
    { userId: user._id, organization:{ orgId:user.organization.orgId,name:user.organization.name},name:user.name,email:user.email, roleId: role._id,
    permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token,data:{userId:user._id,name:user.name,email:user.name,orgId:user.organization.orgId,organizationName: user.organization.name,roleId:role._id,permissions}};
};
