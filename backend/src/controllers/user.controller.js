import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshTokens = async (userID) => {
  try {
    const user = await User.findById(userID);
    if(!user){
      throw new ApiError(404, "user not found wile generating tokens");
    } 
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

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
  console.log("req.files", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    return res.status(400).json(new ApiResponse(400, "avatar is required"));
    // throw new ApiError(400, "avatar is required on user registration")
  }
  console.log(avatarLocalPath)
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

 const updatedUser = User.findById(user._id).select("-password -refreshToken")

  // return response and send cookies
  const options = {
    httpOnly: true,
    secure: true,
  }
  return res
  .status(200)
  .cookies("refreshToken", refreshToken, options)
  .cookies("accessToken", accessToken, options)
  .json(
    new ApiResponse(200, "login successful", {user: updatedUser ,accessToken, refreshToken })
  )
})

const logoutUser = asyncHandler(async (req, res) => {

  

  res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, "logged out successfully"));
})

export { 
  registerUser,
  loginUser,
  logoutUser
};
