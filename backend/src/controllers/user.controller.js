import * as userService from "../services/user.service.js";
import { ERROR_MESSAGES } from "../utils/errorMessages.js";

const handleUserError = (res, error) => {
  switch (error.message) {
    case "INVALID_ROLE":
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.INVALID_ROLE });
    case "CANNOT_CHANGE_OWN_ROLE":
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.CANNOT_CHANGE_OWN_ROLE });
    case "NOT_FOUND":
      return res.status(404).json({ success: false, message: ERROR_MESSAGES.NOT_FOUND });
    default:
      return res.status(500).json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await userService.getAllUsers({ page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    handleUserError(res, error);
  }
};

export const updateRole = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { id } = req.params;
    const { role } = req.body;
    const user = await userService.updateUserRole(adminId, id, role);
    res.json({ success: true, message: "อัปเดต Role สำเร็จ", data: { user } });
  } catch (error) {
    handleUserError(res, error);
  }
};
