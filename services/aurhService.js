const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../models');
const { ApiError } = require('../utils/errors');

const registerUser = async (userData) => {
  const { email, password, firstname,lastname, role  } = userData;

  // Check if user already exists
  const existingUser = await prisma.users.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError('User already exists with this email', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      lastname,
      firstname,
      role
    }
  });


  return {
    message: 'User registered successfully',
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    role: user.role,

  };
};

const loginUser = async ({ email, password }) => {
  // Find user by email
  const user = await prisma.users.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError('Invalid email or password', 401);
  }

  // Check if password matches
  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken(user.id);

  return {
    message: 'User logged in successfully',
    id: user.id,
    email: user.email,
    firstname: user.firstname,  
    lastname: user.lastname,
    role: user.role,
    token
  };
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// this is the api to reset password 
const resetPassword=async(userData)=>{
   const { email, password } = userData;


    // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // This is  to find and update the user password
    const user = await prisma.users.findUnique({
    where: {
      email: email
    }
  });

  if (!user) {
    throw new ApiError('The user with the email you sent is not available in the system ', 404);
  }
  // updated user password
  const updated_user = await prisma.users.update({
    where:{
      email:email
    },
    data:{
      password:hashedPassword
    }
  })

   return {
    message: 'The password updated successfully!',
    id: updated_user.id,
    email: updated_user.email,
    firstname: updated_user.firstname,  
    lastname: updated_user.lastname,
    role: updated_user.role,
  };

}

module.exports = {
  registerUser,
  loginUser,
  resetPassword
};