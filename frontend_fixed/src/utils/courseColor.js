const COURSE_COLORS = [
  "#E3A63E", // amber
  "#5B7FDE", // blue
  "#3B8763", // green
  "#C1443A", // red
  "#9B6BC9", // violet
  "#3FA7B8", // teal
];

export function getCourseColor(courseId) {
  if (!courseId) return "#D8D5CC";
  return COURSE_COLORS[courseId % COURSE_COLORS.length];
}