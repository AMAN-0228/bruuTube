import BaseController from './BaseController';
import dbModels from '../models/index.js';

class UserController extends BaseController{
    constructor() {
        super(dbModels.UserController)
    }
} 

export default UserController;