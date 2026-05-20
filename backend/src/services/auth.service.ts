import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import { AppError } from "../utils/AppError";
import { RegisterInput, LoginInput, AuthResponse } from "../types";


const generateToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { id },
    process.env.JWT_SECRET as string,
    options
  );
};

const buildAuthResponse = (user: InstanceType<typeof UserModel>): AuthResponse => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  token: generateToken(user._id.toString()),
});

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await UserModel.findOne({ email: input.email });

    if (existingUser) {
      throw new AppError("An account with this email already exists", 409);
    }

    const user = await UserModel.create({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    return buildAuthResponse(user);
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    // Explicitly select password since toJSON strips it
    const user = await UserModel.findOne({ email: input.email }).select("+password");

    if (!user || !(await user.comparePassword(input.password))) {
      throw new AppError("Invalid email or password", 401);
    }

    return buildAuthResponse(user);
  },

  async getMe(userId: string): Promise<InstanceType<typeof UserModel>> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  },
};