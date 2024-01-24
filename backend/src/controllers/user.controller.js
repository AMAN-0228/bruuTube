import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

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
    [fullName, userName, email, password].some((field) => field?.trim() === "")
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "all fields are required"));
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

export { registerUser };
