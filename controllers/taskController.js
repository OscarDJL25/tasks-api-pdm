import { Task } from "../model/Task.js";

export const getTasks = async (req, res) => {
  const tasks = await Task.getAll();
  res.json(tasks);
};

export const getTask = async (req, res) => {
  const task = await Task.getById(req.params.id);
  if (!task) return res.status(404).json({ message: "Tarea no encontrada" });
  res.json(task);
};

export const createTask = async (req, res) => {
  const newTask = await Task.create(req.body);
  res.status(201).json(newTask);
};

export const updateTask = async (req, res) => {
  await Task.update(req.params.id, req.body);
  res.json({ message: "Tarea actualizada" });
};

export const deleteTask = async (req, res) => {
  await Task.delete(req.params.id);
  res.json({ message: "Tarea eliminada" });
};
