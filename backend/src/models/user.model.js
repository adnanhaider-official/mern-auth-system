import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  {
    timestamps: true,
  }
);

// Password save hone se pehle hash hoga
userSchema.pre("save", async function () {
  // Agar password change nahi hua to dobara hash nahi karna
  if (!this.isModified("password")) {
    return;
  }
  // Password hash
  this.password = await bcrypt.hash(this.password, 10);
});

// Password compare karne ka method
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// JWT generate karne ka method
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
