import {
  Box,
  Button,
  Divider,
  TextField,
  Typography,
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useAlert from "../hooks/useAlert";
import Form from "../components/Form";
import api, {
  Category,
  DisciplineName,
  Teacher,
  TestFormData,
} from "../services/api";
import { AxiosError } from "axios";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  title: { margin: "15px 0 36px 0", fontSize: "24px", textAlign: "center" },
  input: { marginBottom: "16px" },
  actionsContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "30px 0 60px",
  },
};

function AddTest() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { setMessage } = useAlert();
  const [formData, setFormData] = useState<TestFormData>({
    testTitle: "",
    testPdf: "",
    category: "",
    discipline: "",
    instructor: "",
  });
  const [isDisabled, setIsDisabled] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [disciplines, setDisciplines] = useState<DisciplineName[]>([]);
  const [instructorsByDiscipline, setInstructorsByDiscipline] = useState<Teacher[]>([]);

  useEffect(() => {
    async function loadPage() {
      if (!token) return;
      
      const { data: categories } = await api.getCategories(token);
      setCategories(categories.categories);
      const { data: disciplines } = await api.getDisciplines(token);
      setDisciplines(disciplines.disciplines);
    }
    loadPage();
  }, [token]);

  useEffect(() => {
    async function loadInstructors() {
      if(formData.discipline !== ''){
        if (!token) return;
        const { data: teachers } = await api.getTeachersByDiscipline(token, formData.discipline);
        setInstructorsByDiscipline(teachers.teachers);
        formData.discipline === "" ? setIsDisabled(true) : setIsDisabled(false);
      }
    }
    loadInstructors();
  }, [formData.discipline]);

  function handleInputChange(e: any) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (
      !formData?.testTitle ||
      !formData?.testPdf ||
      !formData?.category ||
      !formData?.discipline ||
      !formData?.instructor
    ) {
      setMessage({ type: "error", text: "Todos os campos são obrigatórios!" });
      return;
    }

    try {
      if (!token) return;
      await api.createTest(formData, token);
      setMessage({ type: "success", text: "Teste criado com sucesso!" });
      navigate("/app/disciplinas");

    } catch (error: Error | AxiosError | any) {
      if (error.response) {
        setMessage({
          type: "error",
          text: error.response.data,
        });
        return;
      }
      setMessage({
        type: "error",
        text: "Erro, tente novamente em alguns segundos!",
      });
    }
  }

  return (
    <>
      <Typography sx={styles.title} variant="h4" component="h1">
        Adicione uma prova
      </Typography>
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
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button 
            variant="contained"
            onClick={() => navigate("/app/adicionar")}
          >
            Adicionar
          </Button>
        </Box>
        <Form onSubmit={handleSubmit}>
          <Box sx={styles.container}>
            <TextField
              required
              name="testTitle"
              sx={styles.input}
              label="Titulo da prova"
              type="text"
              variant="outlined"
              onChange={handleInputChange}
              value={formData.testTitle}
            />
            <TextField
              required
              name="testPdf"
              sx={styles.input}
              label="PDF da prova"
              type="url"
              variant="outlined"
              onChange={handleInputChange}
              value={formData.testPdf}
            />
            <FormControl required fullWidth sx={styles.input}>
              <InputLabel id="category">Categoria</InputLabel>
              <Select
                labelId="category"
                id="category"
                value={formData.category}
                label="Categoria"
                name="category"
                onChange={handleInputChange}
                >
                {categories.map(category => {
                  return <MenuItem key={category.id} value={category.name}>{category.name}</MenuItem>
                })}
              </Select>
            </FormControl>

            <FormControl required fullWidth sx={styles.input}>
              <InputLabel id="discipline">Disciplina</InputLabel>
              <Select
                labelId="discipline"
                id="discipline"
                value={formData.discipline}
                label="Disciplina"
                name="discipline"
                onChange={handleInputChange}
                >
                {disciplines.map(discipline => {
                  return <MenuItem key={discipline.id} value={discipline.name}>{discipline.name}</MenuItem>
                })}
              </Select>
            </FormControl>

            <FormControl required fullWidth disabled={isDisabled}>
              <InputLabel id="instructor">Pessoa Instrutora</InputLabel>
              <Select
                labelId="instructor"
                id="instructor"
                value={formData.instructor}
                label="Pessoa Instrutora"
                name="instructor"
                onChange={handleInputChange}
                >
                {instructorsByDiscipline.length === 0
                ?
                <MenuItem value=""><em>Não há uma Pessoa Instrutora para essa Disciplina</em></MenuItem>
                :
                instructorsByDiscipline.map(instructor => {
                  return <MenuItem key={instructor.id} value={instructor.name}>{instructor.name}</MenuItem>
                })
                }
              </Select>
              <FormHelperText>Selecione uma Disciplina para habilitar este campo</FormHelperText>
            </FormControl>
            <Box sx={styles.actionsContainer}>
              <Button variant="contained" type="submit" style={{ width: "100%" }}>
                Enviar
              </Button>
            </Box>
          </Box>
        </Form>
      </Box>
    </>
  );
}

export default AddTest;
