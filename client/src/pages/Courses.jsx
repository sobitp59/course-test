import { list } from "postcss";
import React, { useEffect, useState } from "react";

const Courses = () => {
  const [courses, setCourses] = useState([]);

  async function getCourses() {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/user/courses",
        {
          headers: {
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjU4N2QyOGNlZWYyMjgzMTAzNjJkNDgiLCJ1c2VybmFtZSI6InNvYml0cHJhc2FkIiwiZW1haWwiOiJzb2JpdHA1OUBnbWFpbC5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcxNzg1MDU0MiwiZXhwIjoxNzE3OTM2OTQyfQ.4Is_L0i9gu_A8DZJnPQ5mGBdqwfeLbBN22WWcbJJaYc",
          },
        }
      );
      const courses = await response.json();
      setCourses(courses?.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getCourses();
  }, []);

  return (
    <div className="text-white">
      <h1>Courses</h1>
      {courses?.length === 0 ? "Loading..." : null}
      {courses?.length > 0 ? (
        <ul className="w-full flex gap-6 flex-wrap">
          {courses.map((course) => (
            <li className="flex h-full flex-col gap-3 border-2 border-gray-600 p-2">
              <img
                className="w-[340px] h-[200px] object-cover"
                src={course.bannerUrl}
                alt=""
              />
              <h3>{course.title}</h3>
              <section className="flex justify-between">
                <p>${course.price}</p>
                <button className="bg-green-300 px-4 py-1 text-black font-medium">
                  Buy
                </button>
              </section>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default Courses;
