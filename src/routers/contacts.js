import { Router } from "express";
import {getAllContactsController , getContactsByIdController, createContactController,patchContactController, deleteContactController } from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {validateBody} from "../middlewares/validateBody.js";
import { createContactSchema, updateContactSchema } from "../validation/contacts.js";
import { isValidId } from "../middlewares/isValidId.js";
import { authenticate } from "../middlewares/authenticate.js";
import {checkElegibility}from "../middlewares/checkElegibility.js";


const router = Router();
router.use(authenticate);

router.get('/', ctrlWrapper(getAllContactsController));

router.get('/:contactId', checkElegibility, isValidId, ctrlWrapper(getContactsByIdController));

router.post('/register', validateBody(createContactSchema), ctrlWrapper(createContactController));

router.patch('/:contactId',checkElegibility, isValidId, validateBody(updateContactSchema), ctrlWrapper(patchContactController));

router.delete('/:contactId', checkElegibility, isValidId, ctrlWrapper(deleteContactController));


export default router;