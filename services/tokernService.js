const jwt = require('jsonwebtoken');
const prisma = require('../models');

// Add token to blocklist
const addToBlocklist = async (token) => {
  const decoded = jwt.decode(token);
  await prisma.blockedToken.create({
    data: {
      token,
      expiresAt: new Date(decoded.exp * 1000) // Convert JWT expiry timestamp to Date
    }
  });
};

// Check if token is blocked
const isTokenBlocked = async (token) => {
  const blockedToken = await prisma.blockedToken.findUnique({
    where: { token }
  });
  return !!blockedToken;
};

module.exports = { addToBlocklist, isTokenBlocked };