"use client";

import { useState } from "react";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (task: Task) => Promise<void>;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure you want to delete the task: "${task.title}"?`);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleComplete(task);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg p-5 shadow-sm transition-all flex flex-col justify-between ${
        task.completed ? "border-green-200 bg-green-50/20" : "border-gray-200"
      }`}
    >
      <div>
        {/* Header: Title and Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className={`text-lg font-semibold text-gray-900 break-words ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {task.title}
          </h3>
          <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full shrink-0 ${
              task.completed
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            {task.completed ? "Completed" : "Not Completed"}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 whitespace-pre-line break-words">
          {task.description ? task.description : <span className="italic text-gray-400">No description</span>}
        </p>
      </div>

      <div>
        {/* Due Date info */}
        <div className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
          <span className="font-medium text-gray-700">Due Date:</span>
          <span>{task.due_date ? task.due_date : "No due date set"}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
          {/* Mark Complete Button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
              task.completed
                ? "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                : "bg-green-600 text-white border-green-600 hover:bg-green-700"
            } disabled:opacity-50`}
          >
            {isToggling ? "Updating..." : task.completed ? "Mark Incomplete" : "Mark Complete"}
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50 ml-auto"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
