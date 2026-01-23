import { Router } from "express";
import { deleteUser, getAllUsers, getDeletedUsers, getUserById, updateUser } from "../controller/userController.js";
const userRouter=Router();
userRouter.route('/all-users').get(getAllUsers);
userRouter.route('/update/:id').patch(updateUser);//{id:userId}
userRouter.route('/delete/:id').delete(deleteUser);//{id:userId}
userRouter.route('/single-user/:id').get(getUserById);//{id:userId}
userRouter.route('/deleted-users').get(getDeletedUsers);//{id:userId}




export default userRouter