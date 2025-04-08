"use client"

import {
  getBoardActivityLogs as getServerBoardActivityLogs,
  getTaskActivityLogs as getServerTaskActivityLogs,
  getUserActivityLogs as getServerUserActivityLogs,
} from "./activity-log-actions"

// Get activity logs for a board
export async function getBoardActivityLogs(
  boardId: string,
  isDemoMode = false
) {
  return getServerBoardActivityLogs(boardId, 1, 20, isDemoMode)
}

// Get activity logs for a task
export async function getTaskActivityLogs(
  taskId: string,
  isDemoMode = false
) {
  return getServerTaskActivityLogs(taskId, 1, 20, isDemoMode)
}

// Get user activity logs
export async function getUserActivityLogs(
  isDemoMode = false
) {
  return getServerUserActivityLogs(1, 20, isDemoMode)
}

