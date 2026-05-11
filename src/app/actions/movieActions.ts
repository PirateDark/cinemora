import { connectDB } from "../../../lib/db";
import { Movie } from "../../../lib/models/Movie";

export async function addMovieByTMDB(tmdbId: string) {
  try {
    await connectDB();

    const apiKey = "ff54d7a5fdc2ab56530491ac8d378131";
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}&language=ar-SA`
    );

    const data = await response.json();

    if (!data.id) throw new Error("لم يتم العثور على الفيلم");

    const embedUrl = `https://superembed.stream/embed/movie/${data.id}`;

    const newMovie = await Movie.findOneAndUpdate(
      { tmdbId: data.id.toString() },
      {
        title: data.title,
        description: data.overview,
        posterPath: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        backdropPath: `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
        releaseDate: data.release_date,
        videoUrl: embedUrl,
        category: "movie",
      },
      { upsert: true, new: true }
    );

    return { success: true, movie: JSON.parse(JSON.stringify(newMovie)) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "فشل في إضافة الفيلم" };
  }
}

export async function getAllMovies(category?: string) {
  try {
    await connectDB();
    const filter = category ? { category } : {};
    const movies = await Movie.find(filter).sort({ createdAt: -1 }).lean();
    return { success: true, movies: JSON.parse(JSON.stringify(movies)) };
  } catch (error) {
    console.error(error);
    return { success: false, error: "فشل في جلب البيانات" };
  }
}

export async function deleteMovie(id: string) {
  try {
    await connectDB();
    await Movie.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "فشل في حذف المحتوى" };
  }
}
