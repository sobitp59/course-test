import mongoose, { Schema } from 'mongoose';

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      require: [true, 'Course price is required'],
    },
    bannerUrl: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

export const Course = mongoose.model('Course', courseSchema);
