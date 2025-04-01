import express, { Application } from "express";
import cors from "cors";

const app: Application = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface MatrixStorage {
  matrixA: number[][];
  matrixB: number[][];
  matrixRes: number[][] | null;
}

let storage: MatrixStorage = {
  matrixA: [],
  matrixB: [],
  matrixRes: null,
};

//Acá se verifica que las matrices se pueden sumar
const canAddMatrices = (matrixA: number[][], matrixB: number[][]): boolean => {
  if (matrixA.length !== matrixB.length) return false;
  for (let i = 0; i < matrixA.length; i++) {
    if (matrixA[i].length !== matrixB[i].length) return false;
  }
  return true;
};

//Acá se verifica que las matrices se pueden multiplicar
const canMultiplyMatrices = (
  matrixA: number[][],
  matrixB: number[][]
): boolean => {
  return matrixA[0].length === matrixB.length;
};

//Suma de matrices
const addMatrices = (matrixA: number[][], matrixB: number[][]): number[][] => {
  return matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
};

// Multiplicación de matrices
const multiplyMatrices = (
  matrixA: number[][],
  matrixB: number[][]
): number[][] => {
  const result: number[][] = Array.from({ length: matrixA.length }, () =>
    Array(matrixB[0].length).fill(0)
  );

  for (let i = 0; i < matrixA.length; i++) {
    for (let j = 0; j < matrixB[0].length; j++) {
      for (let k = 0; k < matrixA[0].length; k++) {
        result[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }
  return result;
};
app.post("/api/matrix/a", (req: express.Request, res: express.Response) => {
  const { data } = req.body;

  if (!Array.isArray(data) || !data.every((row) => Array.isArray(row))) {
    return void res
      .status(400)
      .json({ error: "Formato de datos inválido para la matriz A" });
  }

  storage.matrixA = data;
  storage.matrixRes = null; // Resetear el resultado al modificar una matriz
  res.status(200).json({ message: "Matriz A guardada exitosamente" });
});

app.post("/api/matrix/b", (req: express.Request, res: express.Response) => {
  const { data } = req.body;

  if (!Array.isArray(data) || !data.every((row) => Array.isArray(row))) {
    return void res
      .status(400)
      .json({ error: "Formato de datos inválido para la matriz B" });
  }

  storage.matrixB = data;
  storage.matrixRes = null; // Resetear el resultado al modificar una matriz
  res.status(200).json({ message: "Matriz B guardada exitosamente" });
});

app.get("/api/matrices", (req: express.Request, res: express.Response) => {
  res.status(200).json({
    matrixA: storage.matrixA,
    matrixB: storage.matrixB,
    result: storage.matrixRes,
  });
});

app.post("/api/matrices/add", (req: express.Request, res: express.Response) => {
  if (!canAddMatrices(storage.matrixA, storage.matrixB)) {
    return void res.status(400).json({
      error: "Las matrices no tienen dimensiones compatibles para la suma",
    });
  }

  storage.matrixRes = addMatrices(storage.matrixA, storage.matrixB);
  res.status(200).json(storage.matrixRes);
});

app.post(
  "/api/matrices/multiply",
  (req: express.Request, res: express.Response) => {
    if (!canMultiplyMatrices(storage.matrixA, storage.matrixB)) {
      return void res.status(400).json({
        error:
          "Las matrices no tienen dimensiones compatibles para la multiplicación",
        requirement:
          "El número de columnas de A debe igualar al número de filas de B",
      });
    }

    storage.matrixRes = multiplyMatrices(storage.matrixA, storage.matrixB);
    res.status(200).json({
      message: "Multiplicación realizada exitosamente",
      result: storage.matrixRes,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
