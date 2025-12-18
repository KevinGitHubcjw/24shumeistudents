import { Student } from './types';

export const STUDENT_NAMES = [
  "杨健强", "杜凌羽", "林思妍", "李烨", "李嘉宇",
  "吴宛欣", "钟皓翔", "郑翠琳", "苏颖琪", "梁玥",
  "冯铭杰", "黄富洪", "王文博", "梁银妹", "黄静怡",
  "张星阳", "苏彦铭", "叶梓仪", "林溪", "卢梓贤",
  "潘良聪", "李思禹", "林嘉源", "张钧宁", "林炜隽",
  "符志林", "何逸思", "张丽婷", "梁静文", "何晓雨",
  "周雪婷", "肖文俊", "林静敏", "冯静雯", "杨静杰",
  "伍守旭", "罗锦添", "赵诗雨", "孙奥绮", "林晓锋",
  "张重洋", "余熙雯", "桂蓬浩", "张其杰", "何紫杨",
  "滕飞宇", "梁思凯", "黎颖蒽", "李铖僖", "曾文进",
  "赵香珍", "陈嘉莹", "陈智浦"
];

// Helper to generate random positions on a sphere surface
const generateSpherePositions = (count: number, radius: number): Student[] => {
  const students: Student[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radiusAtY = Math.sqrt(1 - y * y); // radius at y

    const theta = phi * i; // golden angle increment

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    students.push({
      id: i,
      name: STUDENT_NAMES[i % STUDENT_NAMES.length],
      position: [x * radius, y * radius, z * radius],
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    });
  }
  return students;
};

// Use the exact number of students and slightly increase radius for better spacing
export const INITIAL_STUDENTS = generateSpherePositions(STUDENT_NAMES.length, 5.5);