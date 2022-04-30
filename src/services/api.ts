import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
});

interface UserData {
  email: string;
  password: string;
}

function getConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post("/sign-up", signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>("/sign-in", signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface DisciplineName {
  id: number;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
}

export interface TestFormData {
  testTitle: string;
  testPdf: string;
  category: string;
  discipline: string;
  instructor: string;
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

async function getTestsByDiscipline(token: string, filter: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByDiscipline[] }>(
    `/tests?groupBy=disciplines&filterDiscipline=${filter}`,
    config
  );
}

async function getTestsByTeacher(token: string, filter: string) {
  const config = getConfig(token);
  return baseAPI.get<{ tests: TestByTeacher[] }>(
    `/tests?groupBy=teachers&filterTeacher=${filter}`,
    config
  );
}

async function getCategories(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ categories: Category[] }>("/categories", config);
}

async function getDisciplines(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ disciplines: DisciplineName[] }>("/disciplines", config);
}

async function getTeachersByDiscipline(token: string, disciplineName: string) {
  const config = getConfig(token);
  return baseAPI.get<{ teachers: Teacher[] }>(`/teachers/${disciplineName}`, config);
}

async function testView(token: string, testId: number) {
  const config = getConfig(token);
  return baseAPI.get(`/tests/views/${testId}`, config);
}

async function createTest(test: TestFormData, token: string) {
  const config = getConfig(token);
  await baseAPI.post("/tests/create", test, config);
}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  getDisciplines,
  getTeachersByDiscipline,
  testView,
  createTest,
};

export default api;
