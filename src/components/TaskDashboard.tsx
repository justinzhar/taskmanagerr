"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { Task, TaskFormData } from "@/types/task";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";

interface TaskDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function TaskDashboard({ user, onLogout }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter state (All / Incomplete / Completed)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  // Fetch tasks for logged in user
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTasks(data || []);
    } catch (err: unknown) {
      const errObj = err as Error;
      setError("Failed to load tasks: " + (errObj?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create Task
  const handleCreateTask = async (formData: TaskFormData) => {
    setError(null);
    const { data, error: insertError } = await supabase
      .from("tasks")
      .insert([
        {
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          due_date: formData.due_date || null,
          completed: false,
        },
      ])
      .select();

    if (insertError) {
      throw new Error(insertError.message || "Failed to create task");
    }

    if (data && data.length > 0) {
      setTasks((prev) => [data[0], ...prev]);
    } else {
      fetchTasks();
    }
  };

  // Edit Task
  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask) return;
    setError(null);

    const { data, error: updateError } = await supabase
      .from("tasks")
      .update({
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date || null,
        completed: formData.completed,
      })
      .eq("id", editingTask.id)
      .eq("user_id", user.id)
      .select();

    if (updateError) {
      throw new Error(updateError.message || "Failed to update task");
    }

    if (data && data.length > 0) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? data[0] : t))
      );
    } else {
      fetchTasks();
    }
  };

  // Quick Toggle Complete
  const handleToggleComplete = async (task: Task) => {
    setError(null);
    const nextCompleted = !task.completed;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ completed: nextCompleted })
      .eq("id", task.id)
      .eq("user_id", user.id);

    if (updateError) {
      // Revert if error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: task.completed } : t))
      );
      setError("Failed to update status: " + updateError.message);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    setError(null);
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      setError("Failed to delete task: " + deleteError.message);
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Top Header Bar */}
      <header className="bg-white border border-gray-200 rounded-lg p-5 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            SimpleTasks
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Welcome, <span className="font-semibold text-gray-800">{user.email}</span>
          </p>
        </div>

        {/* Action Buttons: Add Task & Logout */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            + Add Task
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Global error banner if an action fails */}
      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter Tabs & Task Counter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === "active"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Not Completed ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === "completed"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </button>
        </div>
      </div>

      {/* Task List / Content Area */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-500 text-sm">Loading your tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-lg p-12 text-center shadow-sm">
          <p className="text-gray-600 text-base font-medium mb-1">
            {filter === "all"
              ? "No tasks found"
              : filter === "active"
              ? "No active tasks"
              : "No completed tasks"}
          </p>
          <p className="text-gray-400 text-sm mb-4">
            {filter === "all"
              ? "Get organized by adding your first task."
              : "Tasks in this category will appear here."}
          </p>
          {filter === "all" && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              + Add Your First Task
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        taskToEdit={editingTask}
      />
    </div>
  );
}
