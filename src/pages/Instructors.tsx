import { ExpandMore, Search } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";

function Instructors() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [teachersDisciplines, setTeachersDisciplines] = useState<
    TestByTeacher[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructorInput, setInstructorInput] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByTeacher(token, "");
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
    }
    loadPage();
  }, [token]);

  function handleInputChange(e: any) {
    setInstructorInput(e.target.value);
  }

  async function searchInstructor(){
    if (!token) return;

    const { data: testsData } = await api.getTestsByTeacher(token, instructorInput);
    setTeachersDisciplines(testsData.tests);
    const { data: categoriesData } = await api.getCategories(token);
    setCategories(categoriesData.categories);
  }

  return (
    <>
      <TextField
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        label="Pesquise por pessoa instrutora"
        value={instructorInput}
        onChange={handleInputChange}
        InputProps={{
        endAdornment: (
            <Search onClick={searchInstructor}/>
        ), }}
      />
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          categories={categories}
          teachersDisciplines={teachersDisciplines}
        />
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines);

  return (
    <Box sx={{ marginTop: "50px" }}>
      {teachers.map((teacher) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography fontWeight="bold">{teacher}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {categories
              .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
              .map((category) => (
                <Categories
                  key={category.id}
                  category={category}
                  teacher={teacher}
                  teachersDisciplines={teachersDisciplines}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ marginBottom: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />
          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
}

async function testView(token: string | null, testId: number){
  if(!token) return;
  await api.testView(token, testId);
}

function Tests({ tests, disciplineName }: TestsProps) {
  const { token } = useAuth();
  return (
    <>
      {tests.map((test) => (
        <Typography 
          key={test.id} 
          color="#878787"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href={test.pdfUrl}
            target="_blank"
            underline="none"
            color="inherit"
            onClick={() => { testView(token, test.id) }}
          >{`${test.name} (${disciplineName})`}</Link>
          <span style={{
            backgroundColor: "#A9A9A9", 
            color: "white", 
            width: "20px", 
            height: "20px", 
            marginRight: "10px", 
            paddingTop: "2px",
            borderRadius: "50px", 
            textAlign: "center",
            fontSize: "12px",
            }}
          ><TestViews key={test.id} views={test}></TestViews>
          </span>
        </Typography>
      ))}
    </>
  );
}

function TestViews(views: any) {
  return (
    <span>{views.views.testView.length}</span>
  );
}

export default Instructors;
