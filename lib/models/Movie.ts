import mongoose, { Schema, Document } from "mongoose";

export interface IMovie extends Document {
  tmdbId: string;
  title: string;
  description: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  videoUrl: string;
  category: "movie" | "series";
}

const MovieSchema = new Schema<IMovie>(
  {
    tmdbId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    posterPath: { type: String, default: "" },
    backdropPath: { type: String, default: "" },
    releaseDate: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    category: { type: String, enum: ["movie", "series"], required: true },
  },
  { timestamps: true },
);

export const Movie = mongoose.models.Movie || mongoose.model<IMovie>("Movie", MovieSchema);
