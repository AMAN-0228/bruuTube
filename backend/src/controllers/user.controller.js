import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import { json } from "express";
const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    if(!user){
      throw new ApiError(404, "user not found wile generating tokens");
    } 
    
    const accessToken = await user.generateAccessToken();
    // console.log(accessToken)
    const refreshToken = await user.generateRefreshToken();
    
    // save refresh token in db
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave:false});

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong during token generation");
  }
  
}

const registerUser = asyncHandler(async (req, res) => {
  // take user inputs
  // validate input fields
  // check avatar file is present or not
  // check if user already exist
  // upload avatar and coverImage on cloudinary
  // create new user
  // check if user created successfully
  // return response without password

  const { fullName, userName, email, password } = req.body;

  if (
    [fullName, userName, email, password].some((field) => !field) 
    
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Fields are missing on user registration"));
  }
  if (
    [fullName, userName, email, password].some((field) => field?.trim() === "")
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "all required fields should be filled"));
    // throw new ApiError(400, "all fields are required on user registration")
  }

  // check if user already exist - username or email
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    return res.status(409).json(new ApiResponse(409, "user already exist"));
    // throw new ApiError(409, "user already exist")
  }
  // let coverImageLocalPath;
  if( !req.files?.avatar ){
    // delete coverImage if avatar is not present
    // fs.unlinkSync(coverImageLocalPath)
    return res.status(400).json(new ApiResponse(400, "avatar is required"));
    // throw new ApiError(400, "avatar is required on user registration")
  }
  
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    return res.status(400).json(new ApiResponse(400, "avatar is required"));
    // throw new ApiError(400, "avatar is required on user registration")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    return res.status(500).json(new ApiResponse(400, "avatar upload failed"));
    // throw new ApiError(400, "avatar upload failed on user registration")
  }
  
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url||"",
  });
  const userCreated = await User.findById( user._id ).select(
    "-password -refreshToken -watchHistory"
  )
  if (!userCreated) {
    return res.status(500).json(new ApiResponse(400, "user creation failed"));
    // throw new ApiError(400, "user creation failed")
  }

//   return res.status(201).json(
//       {message:"User created successfully"}
//   )
  return res.status(201).json(
    new ApiResponse(200, "user created successfully", userCreated)
  );

//   work to be done is to delete avatar and coverImage from cloudinary on error
});

const loginUser = asyncHandler(async (req, res) => {

  // take user inputs
    const { userName, email, password } = req.body;

    // validate input fields 
  if(!userName && !email){
    throw new ApiError(400, "Either username or email is required")
    return res
      .status(400)
      .json(new ApiResponse(400, "Either username or email is provided"));
  }
  if(password.trim()===""){
    return res
      .status(400)
      .json(new ApiResponse(400, "password is required"));
  }

  // check if user exist
  const user = await User.findOne({ 
    $or:[{userName},{email}]
   })

  // check user is not found
  if (!user) {
    return res.status(404).json(new ApiResponse(404, "user not found"));
    // throw new ApiError(404, "user not found")
  }

  // check if password is correct
   const isPass_Correct = await user.isPasswordCorrect(password)

  if (!isPass_Correct) {
    return res.status(400).json(new ApiResponse(400, "wrong password"));
    // throw new ApiError(400, "wrong password")
  }

  // generate access token and refresh token and save refresh token in database
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

 const updatedUser = await User.findById(user._id).select("-password -refreshToken")

  // return response and send cookies
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
  .json(
    new ApiResponse(200, "login successful", {user: updatedUser ,accessToken, refreshToken })
  )
})

const logoutUser = asyncHandler(async (req, res) => {

    // user find in db 
    // user refresh token update
    // clear cookies
  // console.log(req.user)
    const logoutUser = await User.findOneAndUpdate(
      req.user._id,
      {
        $set:{
          refreshToken: undefined,
        }
      },
      {
        new:true,
      }
    )
    // console.log("logoutUser",logoutUser)
    // if( typeof logoutUser?.refreshToken !== undefined ){
    //   throw new ApiError(500, "refresh token didn't change to undefined on DB")
    // }

    const options = {
      httpOnly: true,
      secure: true,
    }

    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(
      new ApiResponse(200, "logout successful")
    )
  
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body.refreshToken
  if( !incomingToken){
    throw new ApiError(401, "token is not provided or present")
  }
  const decodedToken = jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET)
  console.log("decodedToken",decodedToken)

  const user = await User.findById(decodedToken?._id)
  if(user?.refreshToken !== incomingToken){
    throw new ApiError(401, "Token expired")
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .cookie("refreshToken", refreshToken, options)
  .cookie("accessToken", accessToken, options)
  .json(
    new ApiResponse(200, "token refreshed successfully", {accessToken, refreshToken})
  )
})

const updateAccountDetail = asyncHandler(async (req, res) => {
  // get id from access token's variable
  const userId = req.user?._id
  if( !userId ){
    throw new ApiError(401,"Aren't getting, the id of the user ")
  }
  // take fields from user
  const {email, userName, fullName} = req.body

  // validate is any required field is empty
  if(
  [email, userName, fullName].some(field=> field.trim() ==="")
  ){
    throw new ApiError(409, "All required field/(s) should be filed")
  }

  // check all fields marked unique to be containing unique data
  // const listOfUser = await User.find()
  // if(listOfUser?.length > 1){
  //   throw new ApiError(409,"field should contain unique data")
  // }  
  // else if(listOfUser?.length === 1){
  //   if(listOfUser?._id!== userId){
  //     throw new ApiError(409,"field should contain unique data")
  //   }
  // }

  // set new data in DB
  const newUserData = await User.findByIdAndUpdate(
    userId,
    {
      $set:{
        email,
        userName,
        fullName,
      }
    },
    {
      new:true
    }
  ).select("-password -refreshToken")

  return res
  .status(200)
  .json(
    new ApiResponse(203,"Account details updated successful",{user:newUserData})
  )

})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  // get id from access token's variable
  const userId = req.user?._id
  if( !userId ){
    throw new ApiError(401,"Aren't getting, the id of the user ")
  }
    // get fields from user - password, newPassword, conform password(optional)
    const {password, newPassword} = req.body

    if([password,newPassword].some(field=> field.trim()==="")){
      throw new ApiError(409,"Fields are empty")
    }
    // check password is correct
    const user = await User.findById(userId)
    const isPasswordCorrect = await user.isPasswordCorrect(password)
  if(isPasswordCorrect){
    throw new ApiError(409,"current password is wrong")
  }
  // save new password in DB
  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(
    new ApiResponse(203,"password updated")
  )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
  if( !req?.user ){
    throw new ApiError(401,"Failed to fetch current user")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(200,"current user fetched successfully",{user:req.user})
  )
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
  if( !req?.user ){
    throw new ApiError(409,"User is not logged in")
  }
  //take avatar from req.file
  const localAvatarPath = req?.file?.path
  if( !localAvatarPath ){
    throw new ApiError(409,"Avatar not found")
  }

  // upload avatar to cloudinary
  const avatar = await uploadOnCloudinary(localAvatarPath)

  if( !avatar.url ){
    throw new ApiError(500,"Problem on uploading avatar")
  }
  // save avatar url in DB
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}
  ).select("-password -refreshToken")
  // remove previous avatar from cloudinary

  // return 
  return res
  .status(200)
  .json(
    new ApiResponse(203,"Avatar updated successfully",user)
  )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  if( !req?.user ){
    throw new ApiError(409,"User is not logged in")
  }
  //take avatar from req.file
  const localCoverImagePath = req?.file?.path
  if( !localCoverImagePath ){
    throw new ApiError(409,"Cover image not found")
  }

  // upload avatar to cloudinary
  const coverImage = await uploadOnCloudinary(localCoverImagePath)

  if( !coverImage.url ){
    throw new ApiError(500,"Problem on uploading cover image")
  }
  // save avatar url in DB
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:coverImage.url
      }
    },
    {new:true}
  ).select("-password -refreshToken")
  // remove previous avatar from cloudinary

  // return 
  return res
  .status(200)
  .json(
    new ApiResponse(203,"Avatar updated successfully",user)
  )
})

export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAccountDetail,
  changeCurrentPassword,
  getCurrentUser,
  updateUserCoverImage,
  updateUserAvatar
};
